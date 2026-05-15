import prisma from '../client';

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'PayPal',
];

export async function seedPaymentMethods(): Promise<void> {
  console.log('Seeding payment methods...');
  for (const name of PAYMENT_METHODS) {
    await prisma.paymentMethod.upsert({
      where:  { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✓ ${PAYMENT_METHODS.length} payment methods seeded`);
}
