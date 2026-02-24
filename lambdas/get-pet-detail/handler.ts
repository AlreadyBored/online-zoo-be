import { APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../lib/response';
import { maybeSimulateError } from '../../lib/error-simulation';
import { DETAILS } from '../../lib/data/details';
import { petDetailParamsSchema, PetDetailParams } from '../../lib/validation-schemas';
import { withValidation, ValidatedEvent } from '../../lib/validation-middleware';

async function getPetDetailHandler(event: ValidatedEvent<any, PetDetailParams>): Promise<APIGatewayProxyResult> {
  // Error simulation
  const simulatedError = maybeSimulateError();
  if (simulatedError) return simulatedError;

  const id = event.validatedParams!.id;

  const petDetail = DETAILS.find((detail) => detail.id === id);
  if (!petDetail) {
    return errorResponse(404, `Pet with ID ${id} not found`);
  }

  return successResponse(200, { data: petDetail });
}

export const handler = withValidation(
  { paramsSchema: petDetailParamsSchema },
  getPetDetailHandler
);
