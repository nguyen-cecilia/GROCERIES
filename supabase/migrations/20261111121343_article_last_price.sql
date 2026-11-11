create or replace function public.set_last_price() returns trigger
language plpgsql as $$
begin
    if new.price is not null and new.price is distinct from old.price then
        new.last_price := old.price;
end if;
return new;
end;
$$;

create trigger trg_articles_last_price
    before update
    on public.sg_article
    for each row execute function public.set_last_price();
