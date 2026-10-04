-- 1) Activer RLS sur les 4 tables
alter table public.sg_aisle enable row level security;
alter table public.sg_article enable row level security;
alter table public.sg_groceries_list enable row level security;
alter table public.sg_groceries_list_item enable row level security;
alter table public.sg_quantity_unit enable row level security;

-- 2) Tables possédées directement
create
policy "aisles_owner_all" on public.sg_aisle
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create
policy "articles_owner_all" on public.sg_article
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create
policy "lists_owner_all" on public.sg_groceries_list
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create
policy "quantity_unit_owner_all" on public.sg_quantity_unit
  for all;

-- 3) Items : propriété remontée par la liste parente
create
policy "items_owner_via_list" on public.sg_groceries_list_item
  for all
  using (exists (
      select 1 from public.sg_groceries_list l
      where l.id = list_id and l.user_id = auth.uid()))
  with check (exists (
      select 1 from public.sg_groceries_list l
      where l.id = list_id and l.user_id = auth.uid()));
