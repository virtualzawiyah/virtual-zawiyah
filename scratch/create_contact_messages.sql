-- Run this in the Supabase SQL Editor to create the contact_messages table:
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts
CREATE POLICY contact_messages_insert ON public.contact_messages 
  FOR INSERT WITH CHECK (true);

-- Allow admins/founders to read contact messages
CREATE POLICY contact_messages_select ON public.contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('founder', 'academic_director', 'supervisor', 'registrar', 'finance_officer')
    )
  );
