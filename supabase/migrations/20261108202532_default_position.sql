-- On GARDE le default : c'est lui qui rend `position` optionnel dans les types générés
alter table public.sg_aisle alter column position set default 0;

create or replace function public.sg_aisle_next_position()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    -- toujours recalculée : la valeur envoyée par le client est ignorée
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));
select coalesce(max(position) + 1, 0) into new.position
from public.sg_aisle
where user_id = new.user_id;
return new;
end $$;

-- Le trigger existe déjà depuis 20261108200427. On le recrée pour que
-- cette migration soit rejouable (db reset, ré-exécution locale).
drop trigger if exists trg_aisles_position on public.sg_aisle;

create trigger trg_aisles_position
    before insert on public.sg_aisle
    for each row execute function public.sg_aisle_next_position();
