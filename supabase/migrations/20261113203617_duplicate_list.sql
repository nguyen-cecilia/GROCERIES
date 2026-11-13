create
or replace function public.sg_duplicate_groceries_list(p_list_id uuid)
    returns uuid
    language plpgsql
as
$$
declare
v_user_id uuid := auth.uid();
    v_source
public.sg_groceries_list;
    v_label
text;
    v_suffix
int := 1;
    v_new_id
uuid;
begin
select *
into v_source
from public.sg_groceries_list
where id = p_list_id
  and user_id = v_user_id;

if
not found then
        raise exception 'Liste introuvable' using errcode = 'P0002';
end if;

    v_label
:= v_source.label || ' copie';

    -- « Courses copie » existe déjà ? On passe à « Courses copie 2 », etc.
    while
exists (
        select 1
          from public.sg_groceries_list
         where user_id = v_user_id
           and label = v_label
    ) loop
        v_suffix := v_suffix + 1;
        v_label
:= v_source.label || ' copie ' || v_suffix;
end loop;

insert into public.sg_groceries_list (label, budget, user_id)
values (v_label, v_source.budget, v_user_id) returning id
into v_new_id;

insert into public.sg_groceries_list_item
    (list_id, article_id, quantity, quantity_unit_id, checked)
select v_new_id, article_id, quantity, quantity_unit_id, checked
from public.sg_groceries_list_item
where list_id = p_list_id;

return v_new_id;
end;
$$;
