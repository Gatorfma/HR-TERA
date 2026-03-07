create table newsfeed_posts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null unique,
  content    text not null,
  author     text not null,
  slug       text not null unique,
  image      text, -- base64 string
  tags       text[] not null default '{}' check (array_length(tags, 1) >= 1),
  category   text not null check (category in (
    'Çözüm Güncellemeleri',
    'Haberler',
    'Makaleler',
    'Etkinlikler'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on row change
create or replace function update_newsfeed_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_newsfeed_updated_at
before update on newsfeed_posts
for each row execute procedure update_newsfeed_updated_at();

-- Auto-generate slug from title on insert or update
create or replace function generate_newsfeed_slug()
returns trigger as $$
begin
  new.slug := lower(
    regexp_replace(
      regexp_replace(
        trim(new.title),
        '[^a-zA-Z0-9\s]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
  return new;
end;
$$ language plpgsql;

create trigger set_newsfeed_slug
before insert or update of title on newsfeed_posts
for each row execute procedure generate_newsfeed_slug();

-- RLS: no direct access, RPC only
alter table newsfeed_posts enable row level security;
revoke all on table public.newsfeed_posts from anon, authenticated;
