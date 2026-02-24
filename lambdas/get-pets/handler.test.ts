import { handler } from './handler';
import { createMockEvent } from '../common/test-helpers';

describe('get-pets handler', () => {
  it('should return 200 with list of pets', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/pets' });
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('should return 28 pets', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/pets' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    expect(body.data).toHaveLength(28);
  });

  it('should return pets with correct structure', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/pets' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    const firstPet = body.data[0];
    
    expect(firstPet).toHaveProperty('id');
    expect(firstPet).toHaveProperty('name');
    expect(firstPet).toHaveProperty('commonName');
    expect(firstPet).toHaveProperty('description');
    expect(typeof firstPet.id).toBe('number');
    expect(typeof firstPet.name).toBe('string');
  });

  it('should have CORS headers', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/pets' });
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
