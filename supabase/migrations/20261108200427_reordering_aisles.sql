-- 1) Backfill : positions denses et déterministes par utilisateur
with ranked as (
    select id,
           row_number() over (partition by user_id order by position, label, id) - 1 as p
    from public.sg_aisle
)
update public.sg_aisle a
set position = r.p
    from ranked r
where a.id = r.id;

-- 2) Une position unique par utilisateur, vérifiée en fin de transaction
alter table public.sg_aisle
    add constraint sg_aisle_user_position_key
        unique (user_id, position) deferrable initially deferred;

-- 3) L'index dédié devient redondant (l'index unique le remplace)
drop index if exists public.idx_aisles_user;

-- 4) La position est calculée par le serveur, plus par le client
alter table public.sg_aisle alter column position drop default;

create or replace function public.sg_aisle_next_position()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    if new.position is null then
        perform pg_advisory_xact_lock(hashtext(new.user_id::text));
select coalesce(max(position) + 1, 0) into new.position
from public.sg_aisle
where user_id = new.user_id;
end if;
return new;
end $$;

create trigger trg_aisles_position
    before insert on public.sg_aisle
    for each row execute function public.sg_aisle_next_position();

-- 5) Réordonnancement atomique
create or replace function public.sg_reorder_aisles(p_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
begin
    if coalesce(array_length(p_ids, 1), 0)
       <> (select count(*) from public.sg_aisle where user_id = auth.uid()) then
        raise exception 'AISLE_LIST_OUT_OF_SYNC';
end if;

update public.sg_aisle a
set position = v.ord - 1
    from unnest(p_ids) with ordinality as v(id, ord)
where a.id = v.id
  and a.user_id = auth.uid();
end $$;
