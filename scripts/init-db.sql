-- Initialize Headband Database
-- Make headband user a superuser for development
ALTER USER headband WITH SUPERUSER;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create initial schema
CREATE SCHEMA IF NOT EXISTS public;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Create EEG sessions table
CREATE TABLE IF NOT EXISTS public.eeg_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type VARCHAR(100),
  duration_seconds INTEGER,
  sample_rate INTEGER,
  channels INTEGER,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  status VARCHAR(50) DEFAULT 'recording',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create EEG data table
CREATE TABLE IF NOT EXISTS public.eeg_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES eeg_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  channel_1 FLOAT,
  channel_2 FLOAT,
  channel_3 FLOAT,
  channel_4 FLOAT,
  channel_5 FLOAT,
  channel_6 FLOAT,
  channel_7 FLOAT,
  channel_8 FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ML predictions table
CREATE TABLE IF NOT EXISTS public.ml_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES eeg_sessions(id) ON DELETE CASCADE,
  model_version VARCHAR(50),
  prediction_type VARCHAR(100),
  prediction_value FLOAT,
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES users(id),
  category VARCHAR(100),
  level VARCHAR(50),
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user courses (enrollment) table
CREATE TABLE IF NOT EXISTS public.user_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress FLOAT DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Create interventions table
CREATE TABLE IF NOT EXISTS public.interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intervention_type VARCHAR(100),
  title VARCHAR(255),
  description TEXT,
  duration_minutes INTEGER,
  recommended_frequency VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  mood VARCHAR(50),
  tags TEXT[],
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gamification table
CREATE TABLE IF NOT EXISTS public.gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[],
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(100),
  metric_value FLOAT,
  recorded_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_eeg_sessions_user_id ON public.eeg_sessions(user_id);
CREATE INDEX idx_eeg_sessions_start_time ON public.eeg_sessions(start_time);
CREATE INDEX idx_eeg_data_session_id ON public.eeg_data(session_id);
CREATE INDEX idx_eeg_data_timestamp ON public.eeg_data(timestamp);
CREATE INDEX idx_ml_predictions_session_id ON public.ml_predictions(session_id);
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_user_courses_user_id ON public.user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON public.user_courses(course_id);
CREATE INDEX idx_interventions_user_id ON public.interventions(user_id);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(created_at);
CREATE INDEX idx_gamification_user_id ON public.gamification(user_id);
CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_analytics_recorded_date ON public.analytics(recorded_date);

-- Create functions for audit timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eeg_sessions_updated_at BEFORE UPDATE ON public.eeg_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON public.interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gamification_updated_at BEFORE UPDATE ON public.gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert test data
INSERT INTO public.users (email, username, password_hash, first_name, last_name, role)
VALUES (
  'test@headband.local',
  'testuser',
  '$2b$10$test_hash_here_replace_with_real_bcrypt',
  'Test',
  'User',
  'user'
) ON CONFLICT DO NOTHING;

INSERT INTO public.users (email, username, password_hash, first_name, last_name, role)
VALUES (
  'admin@headband.local',
  'admin',
  '$2b$10$admin_hash_here_replace_with_real_bcrypt',
  'Admin',
  'User',
  'admin'
) ON CONFLICT DO NOTHING;

-- Create view for user statistics
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT
  u.id,
  u.username,
  COUNT(DISTINCT es.id) as total_sessions,
  COUNT(DISTINCT je.id) as total_journal_entries,
  COUNT(DISTINCT uc.id) as total_courses,
  COALESCE(g.points, 0) as total_points,
  COALESCE(g.level, 1) as current_level
FROM public.users u
LEFT JOIN public.eeg_sessions es ON u.id = es.user_id
LEFT JOIN public.journal_entries je ON u.id = je.user_id
LEFT JOIN public.user_courses uc ON u.id = uc.user_id
LEFT JOIN public.gamification g ON u.id = g.user_id
GROUP BY u.id, u.username, g.points, g.level;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO headband;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO headband;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO headband;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO headband;
