-- Create admin_roles table to avoid RLS recursion
CREATE TABLE admin_roles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Policies for admin_roles table
CREATE POLICY "Users can view own admin role" ON admin_roles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Service role can manage admin roles" ON admin_roles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles RLS policies to use the admin function
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (is_admin());

-- Add the admin user to admin_roles
INSERT INTO admin_roles (id)
VALUES ('774441a4-3dd8-40c2-bd21-6c3162de0250')
ON CONFLICT (id) DO NOTHING;

-- Add index
CREATE INDEX idx_admin_roles_id ON admin_roles(id);