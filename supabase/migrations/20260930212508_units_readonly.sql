-- Contenir la policy actuelle : elle laissait PUBLIC (dont anon) lire ET écrire
drop
policy if exists quantity_unit_owner_all on public.sg_quantity_unit;

-- Lecture seule pour les deux rôles clients ; aucune policy d'écriture
-- => INSERT/UPDATE/DELETE refusés pour anon/authenticated
create
policy "quantity_unit_read" on public.sg_quantity_unit
    for
select
    to anon, authenticated
    using (true);
