import { handler } from './handler';
import { createMockEvent } from '../common/test-helpers';

describe('get-cameras handler', () => {
  it('should return 200 with list of cameras', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/cameras' });
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should return 28 cameras', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/cameras' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    expect(body.data).toHaveLength(28);
  });

  it('should return cameras with correct structure', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/cameras' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    const firstCamera = body.data[0];
    
    expect(firstCamera).toHaveProperty('id');
    expect(firstCamera).toHaveProperty('text');
    expect(typeof firstCamera.id).toBe('number');
    expect(typeof firstCamera.text).toBe('string');
  });

  it('should have CORS headers', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/cameras' });
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
