-- Add role field to profiles table (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Note: Admin management policies moved to separate admin_roles table
-- to avoid RLS infinite recursion. See migration 015_create_admin_roles.sql

-- Add index for role
CREATE INDEX idx_profiles_role ON profiles(role);
