import { expect } from 'chai';
import { ArgumentMetadata } from '@nestjs/common';

import { ParseSlugIdPipe } from './parse-slug-id.pipe';
import { encodeBase62 } from '../../shared/helpers';

describe('ParseSlugIdPipe', () => {
  let pipe: ParseSlugIdPipe;

  beforeEach(() => {
    pipe = new ParseSlugIdPipe();
  });

  it('should return the original value for non-slug IDs', () => {
    const workflowIdentifier = 'non-slug-id';
    expect(pipe.transform(workflowIdentifier, {} as ArgumentMetadata)).to.equal(workflowIdentifier);

    const internalId = '6615943e7ace93b0540ae377';
    expect(pipe.transform(internalId, {} as ArgumentMetadata)).to.equal(internalId);
  });

  it('should handle invalid encoded IDs', () => {
    const invalidSlugId = 'my-workflow_invalidEncoding';
    expect(pipe.transform(invalidSlugId, {} as ArgumentMetadata)).to.equal(invalidSlugId);
  });

  it('should not trim or decode internalId', () => {
    const internalId = '6615943e7ace93b0540ae377';
    expect(pipe.transform(internalId, {} as ArgumentMetadata)).to.equal(internalId);
  });

  it('should not trim or decode simple workflow identifier', () => {
    const identifier = 'my-workflow';
    expect(pipe.transform(identifier, {} as ArgumentMetadata)).to.equal(identifier);
  });

  it('should return original value for invalid encoded ID', () => {
    const invalidSlug = 'my-workflow_invalid';
    expect(pipe.transform(invalidSlug, {} as ArgumentMetadata)).to.equal(invalidSlug);
  });

  it('should handle slug IDs without known prefixes', () => {
    const internalId = '6615943e7ace93b0540ae377';
    const encodedId = encodeBase62(internalId);
    expect(pipe.transform(`my-workflow_${encodedId}`, {} as ArgumentMetadata)).to.equal(internalId);
  });

  it('should handle internalIds with leading zeros', () => {
    const internalIds = ['6615943e7ace93b0540ae377', '0615943e7ace93b0540ae377', '0015943e7ace93b0540ae377'];

    internalIds.forEach((internalId) => {
      const encodedId = encodeBase62(internalId);
      expect(pipe.transform(`my-workflow_${encodedId}`, {} as ArgumentMetadata)).to.equal(internalId);
    });
  });
});
