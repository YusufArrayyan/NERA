-- Add indexes for better query performance
-- Run this manually: psql -d your_database < add_performance_indexes.sql

-- Index on sessions.userId for faster user session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");

-- Index on sessions.status for filtering active/completed sessions
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Index on sessions.startTime for time-based queries
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions("startTime" DESC);

-- Composite index for common query pattern (userId + status)
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON sessions("userId", status);

-- Index on eeg_logs.sessionId for joining with sessions
CREATE INDEX IF NOT EXISTS idx_eeg_logs_session_id ON eeg_logs("sessionId");

-- Index on eeg_processed.sessionId for joining with sessions
CREATE INDEX IF NOT EXISTS idx_eeg_processed_session_id ON eeg_processed("sessionId");

-- Index on journal_entries.userId for user journal lookups
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries("userId");

-- Index on gamification_badges.userId for user badge lookups
CREATE INDEX IF NOT EXISTS idx_gamification_badges_user_id ON gamification_badges("userId");

-- Index on interventions.sessionId for session interventions
CREATE INDEX IF NOT EXISTS idx_interventions_session_id ON interventions("sessionId");

-- Index on teacher_students.teacherId for class analytics
CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher_id ON teacher_students("teacherId");

-- Index on teacher_students.studentId for student lookups
CREATE INDEX IF NOT EXISTS idx_teacher_students_student_id ON teacher_students("studentId");

-- Analyze tables to update statistics
ANALYZE sessions;
ANALYZE eeg_logs;
ANALYZE eeg_processed;
ANALYZE journal_entries;
ANALYZE gamification_badges;
ANALYZE interventions;
ANALYZE teacher_students;

-- Vacuum to reclaim storage and optimize
VACUUM ANALYZE;
