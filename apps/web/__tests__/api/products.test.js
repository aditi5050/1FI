import { GET } from '@/app/api/products/[slug]/route';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

const mockProduct = {
  name: 'Test Product',
  slug: 'test-product',
  price: 999
};

jest.mock('@/lib/mongoose', () => jest.fn().mockResolvedValue({}));

jest.mock('@/models/Product', () => ({
  findOne: jest.fn().mockImplementation(({ slug }) => {
    if (slug === 'test-product') return Promise.resolve(mockProduct);
    return Promise.resolve(null);
  })
}));

describe('Product API Returns Data', () => {

  it('Returns product that exists', async () => {
    const req = new NextRequest('http://localhost:3000/api/products/test-product');
    const res = await GET(req, { params: { slug: 'test-product' } });
    
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.product.name).toBe('Test Product');
    expect(body.product.price).toBe(999);
  });

  it('Returns 404 when product is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/products/not-found');
    const res = await GET(req, { params: { slug: 'not-found' } });
    
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Product not found');
  });

});