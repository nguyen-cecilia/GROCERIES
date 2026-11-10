create or replace function public.sg_reorder_quantity_units(p_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
    if coalesce(array_length(p_ids, 1), 0)
       <> (select count(*) from public.sg_quantity_unit where user_id = auth.uid()) then
        raise exception 'QUANTITY_UNIT_LIST_OUT_OF_SYNC';
end if;

update public.sg_quantity_unit u
set position = v.ord - 1
    from unnest(p_ids) with ordinality as v(id, ord)
where u.id = v.id
  and u.user_id = auth.uid();
end $$;

-- 1) Backfill dense
with ranked as (
    select id, row_number() over (partition by user_id order by position, label, id) - 1 as p
    from public.sg_quantity_unit
)
update public.sg_quantity_unit u
set position = r.p
    from ranked r
where u.id = r.id;

-- 2) Unicité par utilisateur, vérifiée en fin de transaction
alter table public.sg_quantity_unit
    add constraint sg_quantity_unit_user_position_key
        unique (user_id, position) deferrable initially deferred;
