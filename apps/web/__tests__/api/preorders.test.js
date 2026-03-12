import { POST } from '@/app/api/preorders/route';
import { NextRequest } from 'next/server';

const mockProduct = {
  _id: '6600000000000000000000aa',
  name: 'Apple iPhone 17 Pro',
  slug: 'iphone-17-pro',
  price: 134900,
  variants: [
    { sku: 'IP17P-256-DB', color: 'Deep Blue', storage: '256 GB', price: 134900, imageIndex: 0 },
    { sku: 'IP17P-512-DB', color: 'Deep Blue', storage: '512 GB', price: 154900, imageIndex: 1 },
  ],
};

const mockPlan = {
  name: '6 months EMI',
  tenureMonths: 6,
  interestRate: 0,
  downPayment: 19,
};

jest.mock('@/lib/db/mongoose', () => jest.fn().mockResolvedValue({}));

jest.mock('@/lib/db/models/Product', () => ({
  findOne: jest.fn().mockImplementation(({ slug }) => {
    if (slug === 'iphone-17-pro') return Promise.resolve(mockProduct);
    return Promise.resolve(null);
  }),
}));

jest.mock('@/lib/db/models/EMIPlan', () => ({
  findOne: jest.fn().mockImplementation(({ tenureMonths }) => {
    if (tenureMonths === 6) return Promise.resolve(mockPlan);
    return Promise.resolve(null);
  }),
}));

jest.mock('@/lib/db/models/PreOrder', () => ({
  create: jest.fn().mockImplementation((data) =>
    Promise.resolve({ _id: '6600000000000000000000bb', ...data, createdAt: new Date().toISOString() })
  ),
}));

describe('Pre-Orders API', () => {
  it('creates a pre-order successfully', async () => {
    const req = new NextRequest('http://localhost:3000/api/preorders', {
      method: 'POST',
      body: JSON.stringify({
        productSlug: 'iphone-17-pro',
        planTenure: 6,
        email: 'test@example.com',
        variantSku: 'IP17P-256-DB',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.preOrder.productSlug).toBe('iphone-17-pro');
    expect(body.preOrder.productName).toBe('Apple iPhone 17 Pro');
    expect(body.preOrder.planTenure).toBe(6);
    expect(body.preOrder.email).toBe('test@example.com');
    // (134900 - 19) / 6 = 22480
    expect(body.preOrder.monthlyAmount).toBe(22480);
  });

  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/preorders', {
      method: 'POST',
      body: JSON.stringify({ productSlug: 'iphone-17-pro' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toMatch(/Missing required fields/);
  });

  it('returns 400 for invalid email', async () => {
    const req = new NextRequest('http://localhost:3000/api/preorders', {
      method: 'POST',
      body: JSON.stringify({
        productSlug: 'iphone-17-pro',
        planTenure: 6,
        email: 'not-an-email',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toMatch(/Invalid email/);
  });

  it('returns 404 when product slug does not exist', async () => {
    const req = new NextRequest('http://localhost:3000/api/preorders', {
      method: 'POST',
      body: JSON.stringify({
        productSlug: 'nonexistent-phone',
        planTenure: 6,
        email: 'test@example.com',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe('Product not found');
  });

  it('returns 404 when EMI plan tenure does not exist', async () => {
    const req = new NextRequest('http://localhost:3000/api/preorders', {
      method: 'POST',
      body: JSON.stringify({
        productSlug: 'iphone-17-pro',
        planTenure: 99,
        email: 'test@example.com',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe('EMI plan not found');
  });
});
