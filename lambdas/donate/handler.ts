import { APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../lib/response';
import { maybeSimulateError } from '../../lib/error-simulation';
import { PETS } from '../../lib/data/pets';
import { donationSchema, DonationInput } from '../../lib/validation-schemas';
import { withValidation, ValidatedEvent } from '../../lib/validation-middleware';
import { randomUUID } from 'crypto';

async function donateHandler(event: ValidatedEvent<DonationInput>): Promise<APIGatewayProxyResult> {
  // Error simulation
  const simulatedError = maybeSimulateError();
  if (simulatedError) return simulatedError;

  const { name, email, amount, petId } = event.validatedBody!;

  // Check if pet exists
  const pet = PETS.find((p) => p.id === petId);
  if (!pet) {
    return errorResponse(404, `Pet with ID ${petId} not found`);
  }

  // Generate donation ID
  const donationId = randomUUID();

  console.log(`Donation received: ${donationId}`, {
    name,
    email,
    amount,
    petId,
    petName: pet.name,
  });

  return successResponse(201, {
    data: {
      message: `Thank you for your donation of ${amount} to ${pet.name}!`,
      donationId,
    },
  });
}

export const handler = withValidation(
  { bodySchema: donationSchema },
  donateHandler
);
