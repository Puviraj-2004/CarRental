import { Role } from '@prisma/client';
import prisma from '../client';
import { hashPassword } from '../../core/utils/jwt';
import { env } from '../../config/env';



export async function seedAdmin(): Promise<void> {
  const email    = env.seedAdminEmail;
  const password = env.seedAdminPassword;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin already exists (${email}) — skipping`);
    return;
  }

  const hashed = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  console.log(`✓ Admin user created: ${email}`);
}
