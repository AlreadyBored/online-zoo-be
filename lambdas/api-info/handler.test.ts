import { handler } from './handler';
import { createMockEvent } from '../../lib/test-helpers';

describe('api-info handler', () => {
  it('should return 200 with API info', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/' });
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Online Zoo API is running!');
    expect(body.data).toHaveProperty('version');
    expect(body.data.version).toBe('1.0.0');
  });

  it('should include endpoints information', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    expect(body.data).toHaveProperty('endpoints');
    expect(body.data.endpoints).toHaveProperty('pets');
    expect(body.data.endpoints).toHaveProperty('feedback');
    expect(body.data.endpoints).toHaveProperty('cameras');
    expect(body.data.endpoints).toHaveProperty('auth');
    expect(body.data.endpoints).toHaveProperty('donations');
  });

  it('should include pet endpoints details', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    expect(body.data.endpoints.pets).toHaveProperty('GET /pets');
    expect(body.data.endpoints.pets).toHaveProperty('GET /pets/{id}');
  });

  it('should include auth endpoints details', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/' });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    expect(body.data.endpoints.auth).toHaveProperty('POST /auth/register');
    expect(body.data.endpoints.auth).toHaveProperty('POST /auth/login');
    expect(body.data.endpoints.auth).toHaveProperty('GET /auth/profile');
  });

  it('should have CORS headers', async () => {
    const event = createMockEvent({ httpMethod: 'GET', path: '/' });
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    expect(response.headers).toHaveProperty('Access-Control-Allow-Methods');
  });
});
