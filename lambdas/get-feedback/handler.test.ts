import { handler } from './handler';
import { createMockEvent } from '../../lib/test-helpers';

describe('get-feedback handler', () => {
  it('should return 200 with list of feedback', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/feedback' });
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should return 24 feedback items', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/feedback' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    expect(body.data).toHaveLength(24);
  });

  it('should return feedback with correct structure', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/feedback' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    const firstFeedback = body.data[0];
    
    expect(firstFeedback).toHaveProperty('id');
    expect(firstFeedback).toHaveProperty('city');
    expect(firstFeedback).toHaveProperty('month');
    expect(firstFeedback).toHaveProperty('year');
    expect(firstFeedback).toHaveProperty('text');
    expect(firstFeedback).toHaveProperty('name');
    expect(typeof firstFeedback.id).toBe('number');
    expect(typeof firstFeedback.name).toBe('string');
  });

  it('should have CORS headers', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/feedback' });
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
