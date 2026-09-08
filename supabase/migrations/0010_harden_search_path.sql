-- Closes a gap flagged by Supabase's linter (function_search_path_mutable):
-- every other function in this project sets search_path explicitly except
-- this trigger function, missed because it doesn't reference any table
-- itself (it only touches NEW). Harmless in practice but cheap to close.
create or replace function public.hostmap_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
