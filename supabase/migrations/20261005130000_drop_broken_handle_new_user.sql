-- Supprime le trigger/fonction d'inscription cassés : handle_new_user()
-- référençait public.profiles (table inexistante), ce qui faisait échouer
-- toute nouvelle inscription (et donc la création des unités par défaut).
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
