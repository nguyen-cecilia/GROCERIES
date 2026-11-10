-- 1) Le trigger d'inscription n'écrit plus is_default
create or replace function public.handle_new_user_quantity_units()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
insert into public.sg_quantity_unit (user_id, label, position)
values (new.id, 'Unité', 0),
       (new.id, 'Paquet', 1);
return new;
end $$;

-- 2) La colonne et son index partiel disparaissent
alter table public.sg_quantity_unit
drop column is_default;
