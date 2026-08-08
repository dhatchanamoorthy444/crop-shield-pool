create table public.posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    image_url text,
    created_at timestamptz default now()
);

grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;

alter table public.posts enable row level security;

create policy "Users can view posts" on public.posts for select to authenticated using (true);
create policy "Users can create their own posts" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own posts" on public.posts for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete to authenticated using (auth.uid() = user_id);