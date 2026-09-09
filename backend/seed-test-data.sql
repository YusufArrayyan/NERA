-- Seed test data for Headband MVP
INSERT INTO "public"."users" (id, email, name, "passwordHash", role, "isActive", "isVerified", locale, "createdAt")
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'siswa@neuroadaptive.com', 'Alya Juwita Putri', '$2b$12$9zKTz.6S.eQ5FPK5.LV1.OQU.5LX8y8vHf5vvPxY/xzHu1.HQ9QdS', 'STUDENT', true, true, 'id', now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'guru@neuroadaptive.com', 'Hannibal Lecter, S.Pd', '$2b$12$9zKTz.6S.eQ5FPK5.LV1.OQU.5LX8y8vHf5vvPxY/xzHu1.HQ9QdS', 'TEACHER', true, true, 'id', now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@neuroadaptive.com', 'Admin Sistem', '$2b$12$9zKTz.6S.eQ5FPK5.LV1.OQU.5LX8y8vHf5vvPxY/xzHu1.HQ9QdS', 'ADMIN', true, true, 'id', now())
ON CONFLICT (email) DO NOTHING;

-- Create gamification records for students
INSERT INTO "public"."gamification" (id, "userId", xp, coins, level, streak, "longestStreak", "lastActiveDate", "createdAt")
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 2540, 850, 3, 5, 12, now(), now())
ON CONFLICT ("userId") DO NOTHING;
