-- Create a table for archived users (deleted users history)
create table if not exists archived_users (
  id uuid default gen_random_uuid() primary key,
  clerk_id text not null unique,
  email text not null,
  first_name text,
  last_name text,
  image_url text,
  role text,
  archived_at timestamp with time zone default timezone('utc'::text, now()) not null,
  archived_by text, -- ID of the admin who performed the deletion
  deletion_reason text
);

-- Enable RLS
alter table archived_users enable row level security;

-- Policy: Admins can view archived users
create policy "Admins can view archived users"
  on archived_users for select
  using (
    exists (
      select 1 from admin_users
      where admin_users.user_id = auth.uid()::text
    )
  );

-- Policy: Admins can insert archived users (usually done via server-side, but good to have)
create policy "Admins can insert archived users"
  on archived_users for insert
  with check (
    exists (
      select 1 from admin_users
      where admin_users.user_id = auth.uid()::text
    )
  );

-- Policy: Admins can delete archived users (permanent clean up)
create policy "Admins can delete archived users"
  on archived_users for delete
  using (
    exists (
      select 1 from admin_users
      where admin_users.user_id = auth.uid()::text
    )
  );
