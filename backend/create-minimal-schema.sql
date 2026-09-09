-- Minimal Headband Schema for MVP (created manually to bypass Prisma connection issues)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "public"."users" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) NOT NULL UNIQUE,
  "passwordHash" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  avatar text,
  role varchar(50) NOT NULL DEFAULT 'STUDENT',
  "isVerified" boolean NOT NULL DEFAULT false,
  "isActive" boolean NOT NULL DEFAULT true,
  locale varchar(10) DEFAULT 'id',
  "lastLoginAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" timestamp
);

CREATE INDEX idx_users_email ON "public"."users"(email);
CREATE INDEX idx_users_role ON "public"."users"(role);
CREATE INDEX idx_users_deletedAt ON "public"."users"("deletedAt");

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS "public"."refresh_tokens" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  token varchar(255) NOT NULL UNIQUE,
  "userId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "expiresAt" timestamp NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_token ON "public"."refresh_tokens"(token);
CREATE INDEX idx_refresh_tokens_userId ON "public"."refresh_tokens"("userId");

-- Activity logs table
CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid REFERENCES "public"."users"(id),
  action varchar(100),
  resource varchar(100),
  metadata jsonb,
  ip varchar(45),
  "userAgent" text,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_userId ON "public"."activity_logs"("userId");
CREATE INDEX idx_activity_logs_action ON "public"."activity_logs"(action);
CREATE INDEX idx_activity_logs_createdAt ON "public"."activity_logs"("createdAt");

-- Sessions table (for EEG/learning sessions)
CREATE TABLE IF NOT EXISTS "public"."sessions" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  status varchar(50) NOT NULL DEFAULT 'ACTIVE',
  "learningMode" varchar(50) DEFAULT 'VISUAL',
  "focusCategory" varchar(50),
  "contentId" uuid,
  "startTime" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endTime" timestamp,
  duration integer,
  "avgFocus" float8,
  "avgStress" float8,
  "avgAttention" float8,
  "xpEarned" integer DEFAULT 0,
  "coinsEarned" integer DEFAULT 0,
  notes text,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" timestamp
);

CREATE INDEX idx_sessions_userId ON "public"."sessions"("userId");
CREATE INDEX idx_sessions_status ON "public"."sessions"(status);
CREATE INDEX idx_sessions_startTime ON "public"."sessions"("startTime");
CREATE INDEX idx_sessions_deletedAt ON "public"."sessions"("deletedAt");

-- Gamification table
CREATE TABLE IF NOT EXISTS "public"."gamification" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL UNIQUE REFERENCES "public"."users"(id) ON DELETE CASCADE,
  xp integer DEFAULT 0,
  coins integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  "longestStreak" integer DEFAULT 0,
  "lastActiveDate" timestamp,
  "rafflesScore" integer DEFAULT 0,
  "freudScore" integer DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS "public"."notifications" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL,
  channel varchar(50) NOT NULL DEFAULT 'IN_APP',
  title varchar(255) NOT NULL,
  message text NOT NULL,
  data jsonb,
  "isRead" boolean NOT NULL DEFAULT false,
  "readAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_userId ON "public"."notifications"("userId");
CREATE INDEX idx_notifications_isRead ON "public"."notifications"("isRead");
CREATE INDEX idx_notifications_createdAt ON "public"."notifications"("createdAt");

-- Learning content table
CREATE TABLE IF NOT EXISTS "public"."learning_contents" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  description text,
  type varchar(50) DEFAULT 'TEXT',
  content jsonb NOT NULL,
  difficulty integer DEFAULT 1,
  duration integer,
  tags text[],
  thumbnail text,
  "isPublished" boolean DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" timestamp
);

-- EEG logs table
CREATE TABLE IF NOT EXISTS "public"."eeg_logs" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sessionId" uuid NOT NULL REFERENCES "public"."sessions"(id) ON DELETE CASCADE,
  alpha float8,
  beta float8,
  theta float8,
  gamma float8,
  attention float8,
  meditation float8,
  "signalQuality" float8,
  timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eeg_logs_sessionId ON "public"."eeg_logs"("sessionId");
CREATE INDEX idx_eeg_logs_timestamp ON "public"."eeg_logs"(timestamp);

-- EEG processed table
CREATE TABLE IF NOT EXISTS "public"."eeg_processed" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sessionId" uuid NOT NULL REFERENCES "public"."sessions"(id) ON DELETE CASCADE,
  "focusIndex" float8,
  "stressIndex" float8,
  "fRatio" float8,
  "focusCategory" varchar(50),
  "attentionScore" float8,
  "qualityScore" float8,
  "bandPowers" jsonb,
  features jsonb,
  timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eeg_processed_sessionId ON "public"."eeg_processed"("sessionId");
CREATE INDEX idx_eeg_processed_timestamp ON "public"."eeg_processed"(timestamp);

-- Teacher-student relations
CREATE TABLE IF NOT EXISTS "public"."teacher_students" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "teacherId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "studentId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("teacherId", "studentId")
);

-- Parent-child relations  
CREATE TABLE IF NOT EXISTS "public"."parent_children" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "parentId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "childId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("parentId", "childId")
);

-- Interventions table
CREATE TABLE IF NOT EXISTS "public"."interventions" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "fromUserId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "toUserId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  type varchar(50),
  title varchar(255),
  notes text,
  priority varchar(50) DEFAULT 'MEDIUM',
  status varchar(50) DEFAULT 'PENDING',
  metadata jsonb,
  "resolvedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Journal table
CREATE TABLE IF NOT EXISTS "public"."journals" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  mood varchar(50),
  title varchar(255),
  content text NOT NULL,
  "eegSummary" jsonb,
  "aiGenerated" boolean DEFAULT false,
  tags text[],
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" timestamp
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS "public"."recommendations" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "sessionId" uuid REFERENCES "public"."sessions"(id),
  type varchar(100),
  title varchar(255),
  content text,
  priority integer DEFAULT 1,
  "isRead" boolean DEFAULT false,
  metadata jsonb,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE IF NOT EXISTS "public"."analytics" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "public"."users"(id),
  period varchar(50),
  date timestamp,
  metrics jsonb,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", period, date)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS "public"."achievements" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  description text,
  icon varchar(50) DEFAULT '🏆',
  criteria jsonb,
  "xpReward" integer DEFAULT 100,
  "coinReward" integer DEFAULT 50,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User achievements (join table)
CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "achievementId" uuid NOT NULL REFERENCES "public"."achievements"(id) ON DELETE CASCADE,
  "earnedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "achievementId")
);

-- Rewards table
CREATE TABLE IF NOT EXISTS "public"."rewards" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
  "sessionId" uuid REFERENCES "public"."sessions"(id),
  type varchar(50),
  "xpAmount" integer DEFAULT 0,
  "coinAmount" integer DEFAULT 0,
  reason text,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Missions table
CREATE TABLE IF NOT EXISTS "public"."missions" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255),
  description text,
  criteria jsonb,
  "xpReward" integer DEFAULT 200,
  "coinReward" integer DEFAULT 100,
  "isDaily" boolean DEFAULT false,
  "isWeekly" boolean DEFAULT false,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Device providers table
CREATE TABLE IF NOT EXISTS "public"."device_providers" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255),
  type varchar(50) DEFAULT 'SIMULATOR',
  config jsonb DEFAULT '{}',
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Simulator config table
CREATE TABLE IF NOT EXISTS "public"."simulator_configs" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255),
  pattern varchar(50) DEFAULT 'MODERATE_FOCUS',
  "samplingRate" integer DEFAULT 256,
  "noiseLevel" float8 DEFAULT 0.1,
  duration integer,
  "customParams" jsonb,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS "public"."settings" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key varchar(255) NOT NULL UNIQUE,
  value jsonb,
  category varchar(100) DEFAULT 'general',
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid REFERENCES "public"."users"(id),
  action varchar(100),
  resource varchar(100),
  "oldValue" jsonb,
  "newValue" jsonb,
  ip varchar(45),
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS "public"."permissions" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role varchar(50) NOT NULL,
  action varchar(100) NOT NULL,
  resource varchar(100) NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, action, resource)
);
