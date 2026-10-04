create
extension if not exists pgcrypto;                  -- gen_random_uuid()

create table public.sg_aisle
(
    id         uuid primary key     default gen_random_uuid(),
    label      text        not null,
    color      text        not null,
    position   int         not null default 0,
    user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, label)
);

create table public.sg_article
(
    id         uuid primary key     default gen_random_uuid(),
    label      text        not null,
    price      numeric(8, 2),
    last_price numeric(8, 2), -- nullable : « jamais acheté »
    aisle_id   uuid        references public.sg_aisle (id) on delete set null,
    user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.sg_groceries_list
(
    id         uuid primary key       default gen_random_uuid(),
    label      text          not null,
    budget     numeric(8, 2) not null default 0 check (budget >= 0),
    user_id    uuid          not null default auth.uid() references auth.users (id) on delete cascade,
    created_at timestamptz   not null default now(),
    updated_at timestamptz   not null default now()
);

create table public.sg_quantity_unit
(
    id         uuid primary key     default gen_random_uuid(),
    label      text        not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.sg_groceries_list_item
(
    id               uuid primary key     default gen_random_uuid(),
    list_id          uuid        not null references public.sg_groceries_list (id) on delete cascade,
    article_id       uuid        references public.sg_article (id) on delete set null,
    quantity         int         not null default 1 check (quantity > 0),
    quantity_unit_id uuid        references public.sg_quantity_unit (id) on delete set null,
    checked          boolean     not null default false,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

-- bump updated_at
create
or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at
= now();
return new;
end $$;

create trigger trg_aisles_updated
    before update
    on public.sg_aisle
    for each row execute function public.set_updated_at();

create trigger trg_articles_updated
    before update
    on public.sg_article
    for each row execute function public.set_updated_at();

create trigger trg_groceries_lists_updated
    before update
    on public.sg_groceries_list
    for each row execute function public.set_updated_at();

create trigger trg_groceries_list_items_updated
    before update
    on public.sg_groceries_list_item
    for each row execute function public.set_updated_at();

create trigger trg_quantity_unit_updated
    before update
    on public.sg_quantity_unit
    for each row execute function public.set_updated_at();

-- index
create index idx_aisles_user on public.sg_aisle (user_id, position);
create index idx_articles_user on public.sg_article (user_id);
create index idx_articles_aisle on public.sg_article (aisle_id);
create index idx_lists_user on public.sg_groceries_list (user_id);
create index idx_list_items_list on public.sg_groceries_list_item (list_id);
create index idx_list_items_article on public.sg_groceries_list_item (article_id);
