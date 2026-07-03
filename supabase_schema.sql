-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  profile_image TEXT, -- Base64 or URL
  gender TEXT,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  body_fat_pct NUMERIC,
  goal TEXT,
  experience TEXT,
  experience_mode TEXT,
  equipment TEXT,
  duration_minutes NUMERIC,
  training_days NUMERIC,
  training_style TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);


-- 2. Create Workout Logs Table
CREATE TABLE public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  day TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  completed_sets INTEGER NOT NULL,
  weight_used NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on Workout Logs
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Workout Logs Policies
CREATE POLICY "Users can view their own workout logs" ON public.workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout logs" ON public.workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs" ON public.workout_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout logs" ON public.workout_logs
  FOR DELETE USING (auth.uid() = user_id);


-- 3. Create Exercise GIF Cache Table
CREATE TABLE public.exercise_gif_cache (
  exercise_name TEXT PRIMARY KEY,
  gif_url TEXT,
  source TEXT CHECK (source IN ('workoutx', 'free-exercise-db', 'none')),
  cached_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on Exercise GIF Cache
ALTER TABLE public.exercise_gif_cache ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated or anon) can read the cache
CREATE POLICY "Anyone can read exercise gif cache" ON public.exercise_gif_cache
  FOR SELECT USING (true);

-- Only service_role can write to the cache (by default, since no policies exist for INSERT/UPDATE/DELETE, only service_role/superuser can perform these actions)


-- 4. Create trigger to handle new user creation profile setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (new.id, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
