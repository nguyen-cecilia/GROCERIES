-- Indiquer si une unité intervient dans le calcul du prix (quantité multipliée)

alter table public.sg_quantity_unit
    add column apply_quantity boolean not null default true;

-- Les unités masse/volume : le prix saisi est pour la quantité de la ligne (pas de multiplication)
update public.sg_quantity_unit
set apply_quantity = false
where lower(trim(label)) in ('kg', 'hg', 'g', 'mg', 'l', 'cl', 'dl', 'ml');