-- 1) L'unité passe sur l'article
alter table public.sg_article
    add column quantity_unit_id uuid
        references public.sg_quantity_unit (id) on delete set null;

-- 2) Reprise : l'unité la plus utilisée par article, la plus récente en cas d'égalité
update public.sg_article a
set quantity_unit_id = (
    select i.quantity_unit_id
    from public.sg_groceries_list_item i
    where i.article_id = a.id
      and i.quantity_unit_id is not null
    group by i.quantity_unit_id
    order by count(*) desc, max(i.updated_at) desc
    limit 1
    );

-- 3) La colonne quitte les items
alter table public.sg_groceries_list_item
drop column quantity_unit_id;

-- 4) « Unité » disparaît : les articles concernés passent à null
delete from public.sg_quantity_unit
where lower(trim(label)) = 'unité';

-- 5) Les nouveaux comptes ne reçoivent plus « Unité »
create or replace function public.handle_new_user_quantity_units()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
insert into public.sg_quantity_unit (user_id, label, position)
values (new.id, 'Paquet', 0);
return new;
end $$;

-- 6) La duplication ne copie plus l'unité sur les items
create or replace function public.sg_duplicate_groceries_list(p_list_id uuid)
returns uuid
language plpgsql
as $$
declare
v_user_id uuid := auth.uid();
    v_source  public.sg_groceries_list;
    v_label   text;
    v_suffix  int := 1;
    v_new_id  uuid;
begin
select *
into v_source
from public.sg_groceries_list
where id = p_list_id
  and user_id = v_user_id;

if not found then
        raise exception 'Liste introuvable' using errcode = 'P0002';
end if;

    v_label := v_source.label || ' copie';

    while exists (
        select 1
        from public.sg_groceries_list
        where user_id = v_user_id
          and label = v_label
    ) loop
        v_suffix := v_suffix + 1;
        v_label := v_source.label || ' copie ' || v_suffix;
end loop;

insert into public.sg_groceries_list (label, budget, note, user_id)
values (v_label, v_source.budget, v_source.note, v_user_id)
    returning id into v_new_id;

insert into public.sg_groceries_list_item
(list_id, article_id, quantity, checked)
select v_new_id, article_id, quantity, checked
from public.sg_groceries_list_item
where list_id = p_list_id;

return v_new_id;
end;
$$;
