-- 1. Add education and experience columns to the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience TEXT;

-- 2. Create the teacher profile change requests table
CREATE TABLE IF NOT EXISTS teacher_profile_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    new_avatar_url TEXT,
    new_education TEXT,
    new_experience TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Enable Row Level Security (RLS) on the requests table
ALTER TABLE teacher_profile_requests ENABLE ROW LEVEL SECURITY;

-- 4. Re-create RLS Policies to allow:
--    - Teachers to insert/read their own requests
--    - Content Manager / Admin roles to read and update requests
DROP POLICY IF EXISTS "Users read own profile requests" ON teacher_profile_requests;
DROP POLICY IF EXISTS "Teachers insert own profile requests" ON teacher_profile_requests;
DROP POLICY IF EXISTS "Content manager and admin read all profile requests" ON teacher_profile_requests;
DROP POLICY IF EXISTS "Content manager and admin update all profile requests" ON teacher_profile_requests;

CREATE POLICY "Users read own profile requests" ON teacher_profile_requests 
    FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers insert own profile requests" ON teacher_profile_requests 
    FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Content manager and admin read all profile requests" ON teacher_profile_requests 
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('content_manager', 'admin')
    );

CREATE POLICY "Content manager and admin update all profile requests" ON teacher_profile_requests 
    FOR UPDATE USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('content_manager', 'admin')
    );
