import { maybeSimulateError } from './error-simulation';

describe('maybeSimulateError', () => {
  const originalRandom = Math.random;

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('should return null when TEST_ERROR_PROBABILITY is 0', () => {
    process.env.TEST_ERROR_PROBABILITY = '0';
    const result = maybeSimulateError();
    expect(result).toBeNull();
  });

  it('should return error response when random value is less than probability', () => {
    Math.random = jest.fn(() => 0.1);
    
    const result = maybeSimulateError(0.5);
    
    expect(result).not.toBeNull();
    expect(result?.statusCode).toBe(500);
    const body = JSON.parse(result!.body);
    expect(body.error).toBe('Simulated API error for testing purposes');
    expect(body.isTestError).toBe(true);
    expect(body.timestamp).toBeDefined();
  });

  it('should return null when random value is greater than probability', () => {
    Math.random = jest.fn(() => 0.9);
    
    const result = maybeSimulateError(0.5);
    
    expect(result).toBeNull();
  });

  it('should use default probability of 0.25 when no probability is provided', () => {
    delete process.env.TEST_ERROR_PROBABILITY;
    Math.random = jest.fn(() => 0.2); // less than 0.25
    
    const result = maybeSimulateError();
    
    expect(result).not.toBeNull();
    expect(result?.statusCode).toBe(500);
  });

  it('should use TEST_ERROR_PROBABILITY env var when no parameter is provided', () => {
    process.env.TEST_ERROR_PROBABILITY = '0.75';
    Math.random = jest.fn(() => 0.5); // less than 0.75
    
    const result = maybeSimulateError();
    
    expect(result).not.toBeNull();
    expect(result?.statusCode).toBe(500);
  });

  it('should prefer parameter over env var', () => {
    process.env.TEST_ERROR_PROBABILITY = '0.9';
    Math.random = jest.fn(() => 0.5); // greater than 0.3, less than 0.9
    
    const result = maybeSimulateError(0.3);
    
    expect(result).toBeNull();
  });
});
