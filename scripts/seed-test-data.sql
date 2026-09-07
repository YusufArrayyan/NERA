-- Insert test users
INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, status) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'student@test.local', 'student', '$2b$10$test1234test1234test1234test123', 'Test', 'Student'),
  ('550e8400-e29b-41d4-a716-446655440002', 'teacher@test.local', 'teacher', '$2b$10$test1234test1234test1234test123', 'Test', 'Teacher'),
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@test.local', 'admin', '$2b$10$test1234test1234test1234test123', 'Test', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Insert gamification for student
INSERT INTO gamification (user_id, points, level, streak_days)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 2540, 3, 5)
ON CONFLICT (user_id) DO NOTHING;

-- Count users
SELECT COUNT(*) as total_users FROM users;
