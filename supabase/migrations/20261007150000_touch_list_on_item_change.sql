-- Remonte updated_at de la liste parente quand ses items changent
-- (ajout / modification / suppression) pour que « Liste active »
-- reflète aussi les modifications d'items.
create
or replace function public.touch_groceries_list() returns trigger
language plpgsql as $$
begin
    update public.sg_groceries_list
       set updated_at = now()
     where id = coalesce(new.list_id, old.list_id);
    return coalesce(new, old);
end $$;

drop trigger if exists trg_touch_groceries_list on public.sg_groceries_list_item;
create trigger trg_touch_groceries_list
    after insert or update or delete
    on public.sg_groceries_list_item
    for each row execute function public.touch_groceries_list();