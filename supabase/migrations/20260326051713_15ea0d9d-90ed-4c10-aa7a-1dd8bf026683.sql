-- Create function to auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, career_stage, goals, onboarding_complete)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    '',
    '{}',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users who don't have one
INSERT INTO public.profiles (id, first_name, career_stage, goals, onboarding_complete)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''),
  '',
  '{}',
  true  -- existing users have already gone through onboarding at least once
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;