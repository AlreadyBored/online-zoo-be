import { successResponse, errorResponse } from './response';

describe('response helpers', () => {
  describe('successResponse', () => {
    it('should return response with correct status code', () => {
      const response = successResponse(200, { message: 'OK' });
      
      expect(response.statusCode).toBe(200);
    });

    it('should include CORS headers', () => {
      const response = successResponse(200, { data: 'test' });
      
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      expect(response.headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should stringify body as JSON', () => {
      const data = { message: 'Hello', count: 42 };
      const response = successResponse(200, data);
      
      expect(response.body).toBe(JSON.stringify(data));
      expect(JSON.parse(response.body)).toEqual(data);
    });

    it('should work with different status codes', () => {
      const response201 = successResponse(201, { created: true });
      const response204 = successResponse(204, {});
      
      expect(response201.statusCode).toBe(201);
      expect(response204.statusCode).toBe(204);
    });
  });

  describe('errorResponse', () => {
    it('should return error response with correct status code', () => {
      const response = errorResponse(400, 'Bad request');
      
      expect(response.statusCode).toBe(400);
    });

    it('should include CORS headers', () => {
      const response = errorResponse(500, 'Server error');
      
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      expect(response.headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should format error message correctly', () => {
      const response = errorResponse(404, 'Not found');
      
      const body = JSON.parse(response.body);
      expect(body).toEqual({ error: 'Not found' });
    });

    it('should work with different error codes', () => {
      const response400 = errorResponse(400, 'Bad request');
      const response401 = errorResponse(401, 'Unauthorized');
      const response404 = errorResponse(404, 'Not found');
      const response500 = errorResponse(500, 'Internal error');
      
      expect(response400.statusCode).toBe(400);
      expect(response401.statusCode).toBe(401);
      expect(response404.statusCode).toBe(404);
      expect(response500.statusCode).toBe(500);
    });
  });
});
