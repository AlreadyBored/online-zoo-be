import { APIGatewayProxyResult } from 'aws-lambda';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

export function successResponse(statusCode: number, body: Record<string, unknown>): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function errorResponse(statusCode: number, error: string, extra?: Record<string, unknown>): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error, ...extra }),
  };
}
