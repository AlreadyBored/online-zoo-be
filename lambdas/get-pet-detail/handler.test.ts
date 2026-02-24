import { handler } from './handler';
import { createMockEvent } from '../common/test-helpers';

describe('get-pet-detail handler', () => {
  it('should return 200 with pet detail for valid ID', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/pets/1',
      pathParameters: { id: '1' },
    });
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(1);
  });

  it('should return pet detail with correct structure', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/pets/5',
      pathParameters: { id: '5' },
    });
    const response = await handler(event);
    
    const body = JSON.parse(response.body);
    const pet = body.data;
    
    expect(pet).toHaveProperty('id');
    expect(pet).toHaveProperty('commonName');
    expect(pet).toHaveProperty('scientificName');
    expect(pet).toHaveProperty('type');
    expect(pet).toHaveProperty('size');
    expect(pet).toHaveProperty('diet');
    expect(pet).toHaveProperty('habitat');
    expect(pet).toHaveProperty('range');
    expect(pet).toHaveProperty('latitude');
    expect(pet).toHaveProperty('longitude');
    expect(pet).toHaveProperty('description');
    expect(pet).toHaveProperty('detailedDescription');
  });

  it('should return 404 for non-existent pet ID', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/pets/999',
      pathParameters: { id: '999' },
    });
    const response = await handler(event);
    
    expect(response.statusCode).toBe(404);
    
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Pet with ID 999 not found');
  });

  it('should return 400 for invalid pet ID (non-numeric)', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/pets/abc',
      pathParameters: { id: 'abc' },
    });
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Invalid');
  });

  it('should return 400 when pet ID is missing', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/pets/',
      pathParameters: {},
    });
    const response = await handler(event);
    
    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Pet ID is required');
  });

  it('should have CORS headers', async () => {
    const event = createMockEvent({
      httpMethod: 'GET',
      path: '/pets/1',
      pathParameters: { id: '1' },
    });
    const response = await handler(event);
    
    expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
