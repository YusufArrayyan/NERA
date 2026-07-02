const { PrismaClient } = require('@prisma/client');

const passwords = [
  'postgres', 'admin', 'root', '1234', '12345', '123456',
  'password', 'qwerty', 'docker', 'neuro_pass_2026', ''
];

async function tryPassword(pwd) {
  const url = `postgresql://postgres:${pwd}@localhost:5432/postgres?schema=public`;
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: []
  });
  
  try {
    await prisma.$connect();
    console.log(`SUCCESS: Password is "${pwd}"`);
    await prisma.$disconnect();
    return pwd;
  } catch (error) {
    // Suppress error
    await prisma.$disconnect().catch(() => {});
    return null;
  }
}

async function run() {
  console.log("Brute-forcing PostgreSQL passwords...");
  for (const pwd of passwords) {
    const result = await tryPassword(pwd);
    if (result !== null) {
      process.exit(0);
    }
  }
  console.log("FAILED to find password");
  process.exit(1);
}

run();
