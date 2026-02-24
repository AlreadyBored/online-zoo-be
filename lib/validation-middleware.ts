import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { errorResponse } from './response';

export interface ValidatedEvent<TBody = any, TParams = any> extends APIGatewayProxyEvent {
  validatedBody?: TBody;
  validatedParams?: TParams;
}

export type HandlerWithValidation<TBody = any, TParams = any> = (
  event: ValidatedEvent<TBody, TParams>
) => Promise<APIGatewayProxyResult>;

interface ValidationOptions<TBody = any, TParams = any> {
  bodySchema?: z.ZodSchema<TBody>;
  paramsSchema?: z.ZodSchema<TParams>;
}

export function withValidation<TBody = any, TParams = any>(
  options: ValidationOptions<TBody, TParams>,
  handler: HandlerWithValidation<TBody, TParams>
) {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const validatedEvent: ValidatedEvent<TBody, TParams> = { ...event };

      // Validate body if schema provided
      if (options.bodySchema) {
        if (!event.body) {
          return errorResponse(400, 'Request body is required');
        }

        const body = JSON.parse(event.body);
        const validationResult = options.bodySchema.safeParse(body);

        if (!validationResult.success) {
          const errors = validationResult.error.issues
            .map((err: any) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          return errorResponse(400, errors);
        }

        validatedEvent.validatedBody = validationResult.data;
      }

      // Validate path parameters if schema provided
      if (options.paramsSchema) {
        if (!event.pathParameters) {
          return errorResponse(400, 'Path parameters are required');
        }

        const validationResult = options.paramsSchema.safeParse(event.pathParameters);

        if (!validationResult.success) {
          const errors = validationResult.error.issues
            .map((err: any) => err.message)
            .join(', ');
          return errorResponse(400, errors);
        }

        validatedEvent.validatedParams = validationResult.data;
      }

      // Call the actual handler with validated data
      return await handler(validatedEvent);
    } catch (error) {
      console.error('Error in validation middleware:', error);
      return errorResponse(500, 'Internal server error');
    }
  };
}
