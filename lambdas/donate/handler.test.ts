import { handler } from './handler';
import { createMockEvent } from '../../lib/test-helpers';

describe('donate handler', () => {
  it('should process donation with valid data', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        amount: 50,
        petId: 1,
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(201);
    
    const body = JSON.parse(response.body);
    expect(body.data).toHaveProperty('message');
    expect(body.data.message).toContain('Thank you for your donation');
    expect(body.data).toHaveProperty('donationId');
    expect(body.data.donationId).toBeDefined();
  });

  it('should return 400 when request body is missing', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Request body is required');
  });

  it('should return 400 when required fields are missing', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        amount: 50,
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('email');
    expect(body.error).toContain('petId');
  });

  it('should return 400 when amount is negative', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        amount: -10,
        petId: 1,
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('positive');
  });

  it('should return 400 when amount is zero', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        amount: 0,
        petId: 1,
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('positive');
  });

  it('should return 400 when amount is not a number', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        amount: 'fifty',
        petId: 1,
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('amount');
    expect(body.error).toContain('expected number');
  });

  it('should return 400 when petId is not a number', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        amount: 50,
        petId: 'one',
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('petId');
    expect(body.error).toContain('expected number');
  });

  it('should return 404 when pet does not exist', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        amount: 50,
        petId: 999,
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Pet with ID 999 not found');
  });

  it('should include pet name in success message', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        amount: 100,
        petId: 5,
      }),
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.data.message).toContain('100');
  });

  it('should have CORS headers', async () => {
    const event = createMockEvent({
      httpMethod: 'POST',
      path: '/donations',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        amount: 50,
        petId: 1,
      }),
    });
    
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
