import { BaseRepository } from '@novu/dal';
import { decodeBase62 } from '../../shared/helpers';

export type InternalId = string;
const INTERNAL_ID_LENGTH = 24;
const ENCODED_ID_LENGTH = 16;

function isWorkflowId(value: string) {
  return value.length < ENCODED_ID_LENGTH;
}

function isInternalId(value: string) {
  return BaseRepository.isInternalId(value) && value.length === INTERNAL_ID_LENGTH;
}

function lookoutForId(value: string): string | null {
  if (isInternalId(value)) {
    return value;
  }

  if (isWorkflowId(value)) {
    return value;
  }

  return null;
}

export function parseSlugId(value: string): InternalId {
  if (!value) {
    return value;
  }

  const validId = lookoutForId(value);
  if (validId) {
    return validId;
  }

  const encodedValue = value.slice(-ENCODED_ID_LENGTH);
  let decodedValue: string;
  try {
    decodedValue = decodeBase62(encodedValue);
  } catch (error) {
    return value;
  }
  const validDecodedId = lookoutForId(decodedValue);
  if (validDecodedId) {
    return validDecodedId;
  }

  return value;
}
