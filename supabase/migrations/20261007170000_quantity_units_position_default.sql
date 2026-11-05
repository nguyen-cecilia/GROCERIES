-- Ordre personnalisé + unité par défaut par utilisateur

-- 1) Nouvelles colonnes
alter table public.sg_quantity_unit
    add column position int not null default 0;

alter table public.sg_quantity_unit
    add column is_default boolean not null default false;

-- 2) Backfill position : rang stable par utilisateur (libellé puis id)
with ranked as (
    select
        id,
        row_number() over (
            partition by user_id
            order by label, id
        ) - 1 as position
    from public.sg_quantity_unit
)
update public.sg_quantity_unit q
set position = r.position
from ranked r
where q.id = r.id;

-- 3) Backfill défaut : « Unité » si présente, sinon la première (position minimale)
with primary_unit as (
    select distinct on (user_id) id
    from public.sg_quantity_unit
    order by
        user_id,
        case when lower(trim(label)) = 'unité' then 0 else 1 end,
        position,
        id
)
update public.sg_quantity_unit q
set is_default = true
from primary_unit p
where q.id = p.id
  and not q.is_default;

-- 4) Un seul défaut par utilisateur
create unique index sg_quantity_unit_one_default_idx
    on public.sg_quantity_unit (user_id)
    where is_default;

-- 5) Les nouveaux utilisateurs reçoivent « Unité » en défaut, ordre explicite
create or replace function public.handle_new_user_quantity_units()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.sg_quantity_unit (user_id, label, position, is_default)
    values (new.id, 'Unité', 0, true),
           (new.id, 'Paquet', 1, false);
    return new;
end $$;