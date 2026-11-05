-- Unités de quantité personnalisées par utilisateur (plus de valeurs communes)

-- 1) Repartir d'une base sans valeurs communes
delete from public.sg_quantity_unit;

-- 2) Propriété par utilisateur
alter table public.sg_quantity_unit
    add column user_id uuid not null default auth.uid()
        references auth.users (id) on delete cascade;

-- 3) Unicité + index
alter table public.sg_quantity_unit
    add constraint sg_quantity_unit_user_label_key unique (user_id, label);
create index idx_quantity_units_user on public.sg_quantity_unit (user_id);

-- 4) RLS : propriétaire uniquement
drop policy if exists quantity_unit_read on public.sg_quantity_unit;
create policy "quantity_units_owner_all" on public.sg_quantity_unit
    for all to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- 5) Défauts par utilisateur (Unité, Paquet) à l'inscription
create or replace function public.handle_new_user_quantity_units()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.sg_quantity_unit (user_id, label)
    values (new.id, 'Unité'), (new.id, 'Paquet');
    return new;
end $$;

create trigger on_auth_user_created_quantity_units
    after insert on auth.users
    for each row execute function public.handle_new_user_quantity_units();

-- 6) Backfill des utilisateurs existants (idempotent)
insert into public.sg_quantity_unit (user_id, label)
select u.id, v.label
from auth.users u
cross join (values ('Unité'), ('Paquet')) as v(label)
on conflict (user_id, label) do nothing;
