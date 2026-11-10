create or replace function public.sg_quantity_unit_next_position()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));
select coalesce(max(position) + 1, 0) into new.position
from public.sg_quantity_unit
where user_id = new.user_id;
return new;
end $$;

create trigger trg_quantity_units_position
    before insert on public.sg_quantity_unit
    for each row execute function public.sg_quantity_unit_next_position();
