
-- Add username to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create messages table
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL
);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own received messages (mark as read)"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id);

GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

-- Grant access to profiles for user search
GRANT SELECT ON public.profiles TO authenticated;

-- Function to handle new user username generation
CREATE OR REPLACE FUNCTION public.handle_new_user_username()
RETURNS trigger AS $$
BEGIN
  -- Insert profile if it doesn't exist (handle both profile creation and username generation)
  INSERT INTO public.profiles (user_id, full_name, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    LOWER(REPLACE(new.raw_user_meta_data->>'full_name', ' ', '_')) || '_' || SUBSTR(new.id::text, 1, 4)
  )
  ON CONFLICT (user_id) DO UPDATE
  SET username = LOWER(REPLACE(new.raw_user_meta_data->>'full_name', ' ', '_')) || '_' || SUBSTR(new.id::text, 1, 4)
  WHERE public.profiles.username IS NULL;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to generate username on signup
DROP TRIGGER IF EXISTS on_auth_user_created_username ON auth.users;
CREATE TRIGGER on_auth_user_created_username
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_username();

-- Update existing profiles with a default username if null
UPDATE public.profiles 
SET username = LOWER(REPLACE(full_name, ' ', '_')) || '_' || SUBSTR(user_id::text, 1, 4)
WHERE username IS NULL;
