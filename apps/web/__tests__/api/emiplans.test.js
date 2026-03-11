import { GET } from '@/app/api/emiplans/route';
import { NextRequest } from 'next/server';

const mockPlans = [
  { name: '6 months EMI', tenureMonths: 6, interestRate: 0, downPayment: 19 },
  { name: '9 months EMI', tenureMonths: 9, interestRate: 0, downPayment: 19 },
  { name: '12 months EMI', tenureMonths: 12, interestRate: 0, downPayment: 19 },
];

jest.mock('@/lib/mongoose', () => jest.fn().mockResolvedValue({}));

jest.mock('@/models/EMIPlan', () => ({
  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue([
      { name: '6 months EMI', tenureMonths: 6, interestRate: 0, downPayment: 19 },
      { name: '9 months EMI', tenureMonths: 9, interestRate: 0, downPayment: 19 },
      { name: '12 months EMI', tenureMonths: 12, interestRate: 0, downPayment: 19 },
    ]),
  }),
}));

describe('EMI Plans API', () => {
  it('returns all EMI plans', async () => {
    const req = new NextRequest('http://localhost:3000/api/emiplans');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.emiplans).toHaveLength(3);
    expect(body.emiplans[0].tenureMonths).toBe(6);
    expect(body.emiplans[2].tenureMonths).toBe(12);
  });

  it('computes monthlyAmount when price param is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/emiplans?price=134900');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    // 6-month plan: (134900 - 19) / 6 = 22480.17 → 22480
    expect(body.emiplans[0].monthlyAmount).toBe(22480);

    // 9-month plan: (134900 - 19) / 9 = 14987
    expect(body.emiplans[1].monthlyAmount).toBe(14987);

    // 12-month plan: (134900 - 19) / 12 = 11240.08 → 11240
    expect(body.emiplans[2].monthlyAmount).toBe(11240);
  });

  it('returns null monthlyAmount when no price param', async () => {
    const req = new NextRequest('http://localhost:3000/api/emiplans');
    const res = await GET(req);

    const body = await res.json();
    body.emiplans.forEach((plan) => {
      expect(plan.monthlyAmount).toBeNull();
    });
  });
});
