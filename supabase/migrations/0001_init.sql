-- Mirada OS schema v1
create type user_role as enum ('admin', 'merchandiser', 'designer', 'rd_executive', 'embroidery_executive', 'management');
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role user_role,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles (id, email) values (new.id, new.email); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can read all profiles" on public.profiles for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins can update any profile" on public.profiles for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
