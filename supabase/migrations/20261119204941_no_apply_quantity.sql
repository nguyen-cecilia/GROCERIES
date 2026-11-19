-- La quantité peut être décimale : 0,5 kg, 0,25 L
alter table public.sg_groceries_list_item
alter column quantity type numeric(10,3) using quantity::numeric(10,3);

-- Le prix est toujours le prix d'une unité
alter table public.sg_quantity_unit
drop column apply_quantity;
