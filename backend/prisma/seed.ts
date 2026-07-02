import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Create Demo Users ────────────────
  const passwordHash = await bcrypt.hash('Demo1234!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@neuroadaptive.com' },
    update: {},
    create: {
      email: 'admin@neuroadaptive.com',
      name: 'Admin Sistem',
      passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
      locale: 'id',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'guru@neuroadaptive.com' },
    update: {},
    create: {
      email: 'guru@neuroadaptive.com',
      name: 'Hannibal Lecter, S.Pd',
      passwordHash,
      role: UserRole.TEACHER,
      isVerified: true,
      locale: 'id',
    },
  });

  const counselor = await prisma.user.upsert({
    where: { email: 'konselor@neuroadaptive.com' },
    update: {},
    create: {
      email: 'konselor@neuroadaptive.com',
      name: 'Dr. Sarah Konselor',
      passwordHash,
      role: UserRole.COUNSELOR,
      isVerified: true,
      locale: 'id',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'siswa@neuroadaptive.com' },
    update: {},
    create: {
      email: 'siswa@neuroadaptive.com',
      name: 'Alya Juwita Putri',
      passwordHash,
      role: UserRole.STUDENT,
      isVerified: true,
      locale: 'id',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'siswa2@neuroadaptive.com' },
    update: {},
    create: {
      email: 'siswa2@neuroadaptive.com',
      name: 'Budi Santoso',
      passwordHash,
      role: UserRole.STUDENT,
      isVerified: true,
      locale: 'id',
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: 'orangtua@neuroadaptive.com' },
    update: {},
    create: {
      email: 'orangtua@neuroadaptive.com',
      name: 'Ibu Putri',
      passwordHash,
      role: UserRole.PARENT,
      isVerified: true,
      locale: 'id',
    },
  });

  // ─── Gamification for Students ────────
  for (const s of [student, student2]) {
    await prisma.gamification.upsert({
      where: { userId: s.id },
      update: {},
      create: { userId: s.id, xp: 2540, coins: 850, level: 3, streak: 5, longestStreak: 12, lastActiveDate: new Date() },
    });
  }

  // ─── Teacher-Student Relations ────────
  await prisma.teacherStudent.upsert({
    where: { teacherId_studentId: { teacherId: teacher.id, studentId: student.id } },
    update: {},
    create: { teacherId: teacher.id, studentId: student.id },
  });
  await prisma.teacherStudent.upsert({
    where: { teacherId_studentId: { teacherId: teacher.id, studentId: student2.id } },
    update: {},
    create: { teacherId: teacher.id, studentId: student2.id },
  });

  // ─── Parent-Child Relations ───────────
  await prisma.parentChild.upsert({
    where: { parentId_childId: { parentId: parent.id, childId: student.id } },
    update: {},
    create: { parentId: parent.id, childId: student.id },
  });

  // ─── Achievements ────────────────────
  const achievements = [
    { name: 'First Session', description: 'Complete your first learning session', icon: '🎯', criteria: { type: 'sessions_completed', threshold: 1 }, xpReward: 100, coinReward: 50 },
    { name: 'Focus Master', description: 'Complete 10 learning sessions', icon: '🧠', criteria: { type: 'sessions_completed', threshold: 10 }, xpReward: 500, coinReward: 200 },
    { name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', criteria: { type: 'streak_days', threshold: 7 }, xpReward: 300, coinReward: 150 },
    { name: 'Scholar', description: 'Reach Level 5', icon: '🎓', criteria: { type: 'level', threshold: 5 }, xpReward: 1000, coinReward: 500 },
    { name: 'Zen Mind', description: 'Complete 25 sessions', icon: '🧘', criteria: { type: 'sessions_completed', threshold: 25 }, xpReward: 750, coinReward: 300 },
    { name: 'XP Hunter', description: 'Earn 5000 total XP', icon: '⚡', criteria: { type: 'xp_total', threshold: 5000 }, xpReward: 500, coinReward: 250 },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { id: a.name }, // Will fail, use create
      update: {},
      create: a,
    }).catch(() => prisma.achievement.create({ data: a }));
  }

  // ─── Missions ─────────────────────────
  const missions = [
    { title: 'Daily Focus', description: 'Complete a 15-minute focused session', criteria: { type: 'focus_minutes', threshold: 15 }, xpReward: 100, coinReward: 50, isDaily: true },
    { title: 'Calm Mind', description: 'Maintain stress below 30% for an entire session', criteria: { type: 'low_stress_session', threshold: 30 }, xpReward: 150, coinReward: 75, isDaily: true },
    { title: 'Weekly Challenge', description: 'Complete 5 sessions this week', criteria: { type: 'weekly_sessions', threshold: 5 }, xpReward: 500, coinReward: 200, isWeekly: true },
  ];

  for (const m of missions) {
    await prisma.mission.create({ data: m }).catch(() => {});
  }

  // ─── Learning Content ─────────────────
  const contents = [
    { title: 'Pengenalan Gelombang Otak', description: 'Belajar tentang gelombang Alpha, Beta, dan Theta', type: 'VISUAL' as any, content: { body: 'Gelombang otak adalah sinyal listrik yang dihasilkan oleh aktivitas neuron di otak...', imageUrl: '/content/brain-waves.jpg' }, difficulty: 1, tags: ['neuroscience', 'beginner'], isPublished: true },
    { title: 'Teknik Fokus Mendalam', description: 'Metode untuk meningkatkan konsentrasi belajar', type: 'AUDITORY' as any, content: { body: 'Teknik pomodoro dan teknik fokus lainnya...', audioUrl: '/content/focus-guide.mp3' }, difficulty: 2, tags: ['focus', 'technique'], isPublished: true },
    { title: 'Quiz Interaktif: Kognitif', description: 'Uji pemahaman kognitif Anda', type: 'INTERACTIVE' as any, content: { questions: [{ q: 'Apa itu gelombang Alpha?', options: ['Fokus tinggi', 'Relaksasi', 'Tidur', 'Stress'], answer: 1 }] }, difficulty: 2, tags: ['quiz', 'cognitive'], isPublished: true },
    { title: 'Video: Bagaimana EEG Membantu Belajar', description: 'Video edukatif tentang teknologi EEG', type: 'VIDEO' as any, content: { body: 'Electroencephalography (EEG) adalah metode non-invasif untuk merekam aktivitas listrik otak...', videoUrl: '/content/eeg-intro.mp4' }, difficulty: 1, tags: ['eeg', 'video'], isPublished: true },
    { title: 'Latihan Mindfulness untuk Pelajar', description: 'Praktik mindfulness untuk mengurangi stress', type: 'VISUAL' as any, content: { body: 'Mindfulness adalah praktik kesadaran penuh...', steps: ['Duduk dengan nyaman', 'Tutup mata', 'Fokus pada pernapasan', 'Amati pikiran tanpa menghakimi'] }, difficulty: 1, tags: ['mindfulness', 'stress'], isPublished: true },
  ];

  for (const c of contents) {
    await prisma.learningContent.create({ data: c }).catch(() => {});
  }

  // ─── Simulated Sessions with EEG Data ─
  const patterns = ['HIGH_FOCUS', 'MODERATE_FOCUS', 'LOW_FOCUS', 'MODERATE_FOCUS', 'HIGH_FOCUS'];

  for (let i = 0; i < 5; i++) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - (4 - i));
    startTime.setHours(14 + i, 0, 0, 0);

    const session = await prisma.session.create({
      data: {
        userId: student.id,
        status: 'COMPLETED',
        learningMode: i % 3 === 0 ? 'VISUAL' : i % 3 === 1 ? 'AUDITORY' : 'INTERACTIVE',
        focusCategory: patterns[i] === 'HIGH_FOCUS' ? 'HIGH' : patterns[i] === 'LOW_FOCUS' ? 'LOW' : 'MODERATE',
        startTime,
        endTime: new Date(startTime.getTime() + 30 * 60 * 1000), // 30 min
        duration: 1800,
        avgFocus: 50 + Math.random() * 40,
        avgStress: 20 + Math.random() * 30,
        avgAttention: 55 + Math.random() * 35,
        xpEarned: 100 + Math.floor(Math.random() * 200),
        coinsEarned: 50 + Math.floor(Math.random() * 100),
      },
    });

    // Add EEG data points (30 points = 30 seconds sample)
    for (let j = 0; j < 30; j++) {
      const alpha = 10 + Math.random() * 10;
      const beta = 15 + Math.random() * 15;
      const theta = 5 + Math.random() * 8;
      const fRatio = beta / (alpha + theta);

      await prisma.eegLog.create({
        data: {
          sessionId: session.id,
          alpha,
          beta,
          theta,
          gamma: 20 + Math.random() * 20,
          attention: 50 + Math.random() * 40,
          meditation: 30 + Math.random() * 40,
          signalQuality: 85 + Math.random() * 15,
          timestamp: new Date(startTime.getTime() + j * 1000),
        },
      });

      await prisma.eegProcessed.create({
        data: {
          sessionId: session.id,
          focusIndex: 50 + Math.random() * 40,
          stressIndex: 20 + Math.random() * 30,
          fRatio: Math.round(fRatio * 100) / 100,
          focusCategory: fRatio > 1.5 ? 'HIGH' : fRatio >= 1.0 ? 'MODERATE' : 'LOW',
          attentionScore: 55 + Math.random() * 35,
          qualityScore: 85 + Math.random() * 15,
          bandPowers: { delta: 3 + Math.random() * 4, theta, alpha, beta, gamma: 20 + Math.random() * 20 },
          timestamp: new Date(startTime.getTime() + j * 1000),
        },
      });
    }
  }

  // ─── Notifications ────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: student.id, type: 'STUDY_REMINDER', title: 'Waktunya Belajar! 📚', message: 'Jangan lupa sesi belajar hari ini. Streak kamu sudah 5 hari!', channel: 'IN_APP' },
      { userId: student.id, type: 'ACHIEVEMENT', title: 'Achievement Unlocked! 🎯', message: 'Selamat! Kamu mendapatkan badge "First Session"', channel: 'IN_APP' },
      { userId: student.id, type: 'AI_RECOMMENDATION', title: 'Saran AI 🤖', message: 'Berdasarkan analisis EEG, coba mode Visual untuk sesi berikutnya.', channel: 'IN_APP' },
      { userId: teacher.id, type: 'SYSTEM', title: 'Siswa Baru Terdaftar', message: 'Alya Juwita Putri telah bergabung ke kelas Anda.', channel: 'IN_APP' },
    ],
  });

  // ─── Journals ─────────────────────────
  await prisma.journal.create({
    data: {
      userId: student.id,
      title: 'Jurnal Kognitif — Hari Pertama',
      content: '📊 Fokus rata-rata: 72%\n💆 Tingkat stress: 25%\n📚 Sesi selesai: 2\n\n🌟 Hari yang produktif! Otak saya sangat fokus terutama saat menggunakan mode Visual.',
      mood: 'HAPPY',
      aiGenerated: true,
      eegSummary: { avgFocus: 72, avgStress: 25, sessions: 2 },
    },
  });

  // ─── Device Provider ──────────────────
  await prisma.deviceProvider.create({
    data: { name: 'EEG Simulator v1.0', type: 'SIMULATOR', config: { samplingRate: 256, defaultPattern: 'MODERATE_FOCUS' }, isActive: true },
  }).catch(() => {});

  // ─── Simulator Config ─────────────────
  await prisma.simulatorConfig.create({
    data: { name: 'Default Simulator', pattern: 'MODERATE_FOCUS', samplingRate: 256, noiseLevel: 0.1, isActive: true },
  }).catch(() => {});

  // ─── Settings ─────────────────────────
  const settings = [
    { key: 'app.name', value: '"Neuro-Adaptive Cloud Learning"', category: 'general' },
    { key: 'app.locale', value: '"id"', category: 'general' },
    { key: 'eeg.provider', value: '"simulator"', category: 'eeg' },
    { key: 'eeg.samplingRate', value: '256', category: 'eeg' },
    { key: 'ai.provider', value: '"rule-based"', category: 'ai' },
    { key: 'gamification.enabled', value: 'true', category: 'gamification' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: JSON.parse(s.value) },
      create: { key: s.key, value: JSON.parse(s.value), category: s.category },
    });
  }

  console.log('✅ Seed completed!');
  console.log('');
  console.log('📋 Demo Accounts:');
  console.log('  Student:   siswa@neuroadaptive.com / Demo1234!');
  console.log('  Teacher:   guru@neuroadaptive.com / Demo1234!');
  console.log('  Counselor: konselor@neuroadaptive.com / Demo1234!');
  console.log('  Parent:    orangtua@neuroadaptive.com / Demo1234!');
  console.log('  Admin:     admin@neuroadaptive.com / Demo1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
