-- ============================================================
-- 1) List posts with pagination (no content, public access)
-- ============================================================
create or replace function public.get_newsfeed_posts(
  n               int,
  page            int  default 1,
  category_filter text default null,
  search_query    text default null
)
returns table (
  id         uuid,
  title      text,
  author     text,
  slug       text,
  image      text,
  tags       text[],
  category   text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if n <= 0 then
    raise exception 'n must be a positive integer'
      using errcode = 'P0400';
  end if;

  if page <= 0 then
    raise exception 'page must be a positive integer'
      using errcode = 'P0400';
  end if;

  return query
    select
      p.id,
      p.title,
      p.author,
      p.slug,
      p.image,
      p.tags,
      p.category,
      p.created_at,
      p.updated_at
    from newsfeed_posts p
    where
      (category_filter is null or p.category = category_filter)
      and
      (search_query is null or (
        p.title ilike '%' || search_query || '%'
        or exists (
          select 1 from unnest(p.tags) t where t ilike '%' || search_query || '%'
        )
      ))
    order by p.created_at desc
    limit n
    offset (page - 1) * n;
end;
$$;

grant execute on function public.get_newsfeed_posts(int, int, text, text) to anon, authenticated;


-- ============================================================
-- 2) Get a single post by id or slug
--    Unauthenticated users get content truncated to 1500 chars
-- ============================================================
create or replace function public.get_newsfeed_post(
  post_id   uuid default null,
  post_slug text default null
)
returns table (
  id         uuid,
  title      text,
  content    text,
  author     text,
  slug       text,
  image      text,
  tags       text[],
  category   text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if post_id is null and post_slug is null then
    raise exception 'Either post_id or post_slug must be provided'
      using errcode = 'P0400';
  end if;

  return query
    select
      p.id,
      p.title,
			case
			when auth.role() = 'anon' then
					left(p.content, greatest(1, (length(p.content) * 0.25)::int))
			else p.content
			end as content,
      p.author,
      p.slug,
      p.image,
      p.tags,
      p.category,
      p.created_at,
      p.updated_at
    from newsfeed_posts p
    where
      (post_id   is not null and p.id   = post_id)
      or
      (post_slug is not null and p.slug = post_slug)
    limit 1;
end;
$$;

grant execute on function public.get_newsfeed_post(uuid, text) to anon, authenticated;


-- ============================================================
-- 3) Upsert a post (admin only)
--    - id provided   -> update
--    - id is null    -> insert
-- ============================================================
create or replace function public.upsert_newsfeed_post(
  post_title    text,
  post_content  text,
  post_author   text,
  post_category text,
  post_image    text     default null,
  post_tags     text[]   default '{}',
  post_id       uuid     default null
)
returns table (
  id         uuid,
  title      text,
  author     text,
  slug       text,
  image      text,
  tags       text[],
  category   text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required'
      using errcode = 'P0403';
  end if;

  if post_id is not null then
    -- UPDATE
    return query
      update newsfeed_posts p
      set
        title    = post_title,
        content  = post_content,
        author   = post_author,
        category = post_category,
        image    = post_image,
        tags     = post_tags
        -- slug and updated_at are handled by their triggers
      where p.id = post_id
      returning
        p.id, p.title, p.author, p.slug, p.image, p.tags, p.category, p.created_at, p.updated_at;

    if not found then
      raise exception 'Post with id % not found', post_id
        using errcode = 'P0404';
    end if;

  else
    -- INSERT
    return query
      insert into newsfeed_posts (title, content, author, category, image, tags)
      values (post_title, post_content, post_author, post_category, post_image, post_tags)
      returning
        newsfeed_posts.id,
        newsfeed_posts.title,
        newsfeed_posts.author,
        newsfeed_posts.slug,
        newsfeed_posts.image,
        newsfeed_posts.tags,
        newsfeed_posts.category,
        newsfeed_posts.created_at,
        newsfeed_posts.updated_at;
  end if;
end;
$$;

grant execute on function public.upsert_newsfeed_post(text, text, text, text, text, text[], uuid) to authenticated;
