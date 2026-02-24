import { errorResponse } from './response';
import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Simulates a random API error for frontend testing purposes.
 * Returns an error response if the random check fails, or null if no error.
 *
 * @param probability - Probability of error (0.0 to 1.0), defaults to 0.25
 */
export function maybeSimulateError(probability?: number): APIGatewayProxyResult | null {
  const prob = probability ?? parseFloat(process.env.TEST_ERROR_PROBABILITY || '0.25');

  if (Math.random() < prob) {
    return errorResponse(500, 'Simulated API error for testing purposes', {
      isTestError: true,
      timestamp: new Date().toISOString(),
    });
  }

  return null;
}
