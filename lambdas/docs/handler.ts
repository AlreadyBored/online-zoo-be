import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const HTML_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'text/html; charset=utf-8',
};

const JSON_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

function getBaseUrl(event: APIGatewayProxyEvent): string {
  const domainName = event.requestContext?.domainName;
  const stage = event.requestContext?.stage;

  if (!domainName || !stage) {
    return 'http://localhost';
  }

  return `https://${domainName}/${stage}`;
}

function createOpenApiSpec(baseUrl: string): Record<string, unknown> {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Online Zoo Backend API',
      version: '1.0.0',
      description: 'Serverless API for Online Zoo assignment',
    },
    servers: [
      {
        url: baseUrl,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: {
      '/': {
        get: {
          summary: 'API information',
          responses: {
            '200': { description: 'API info response' },
          },
        },
      },
      '/pets': {
        get: {
          summary: 'Get all pets',
          responses: {
            '200': { description: 'List of pets' },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/pets/{id}': {
        get: {
          summary: 'Get pet details by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': { description: 'Pet detail' },
            '404': { description: 'Pet not found' },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/feedback': {
        get: {
          summary: 'Get all feedback',
          responses: {
            '200': { description: 'List of feedback items' },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/cameras': {
        get: {
          summary: 'Get all cameras',
          responses: {
            '200': { description: 'List of cameras' },
            '500': { description: 'Internal server error' },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Register user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['login', 'password', 'name', 'email'],
                  properties: {
                    login: { type: 'string' },
                    password: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'User registered successfully' },
            '400': { description: 'Validation error' },
            '409': { description: 'User already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['login', 'password'],
                  properties: {
                    login: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/profile': {
        get: {
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Current user profile' },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/donations': {
        post: {
          summary: 'Submit donation',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'amount', 'petId'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    amount: { type: 'number', minimum: 0.01 },
                    petId: { type: 'integer' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Donation accepted' },
            '400': { description: 'Validation error' },
            '500': { description: 'Internal server error' },
          },
        },
      },
    },
  };
}

function createSwaggerHtml(specUrl: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Online Zoo API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    html, body { margin: 0; padding: 0; background: #fafafa; }
    #swagger-ui { max-width: 1200px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '${specUrl}',
      dom_id: '#swagger-ui',
      deepLinking: true,
      displayRequestDuration: true,
      presets: [SwaggerUIBundle.presets.apis],
    });
  </script>
</body>
</html>`;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: '',
    };
  }

  const route = event.resource || event.path;
  const baseUrl = getBaseUrl(event);

  if (route.endsWith('/docs/openapi.json') || event.path.endsWith('/docs/openapi.json')) {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(createOpenApiSpec(baseUrl)),
    };
  }

  const html = createSwaggerHtml(`${baseUrl}/docs/openapi.json`);
  return {
    statusCode: 200,
    headers: HTML_HEADERS,
    body: html,
  };
}
