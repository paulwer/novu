import { describe, expectTypeOf, it } from 'vitest';
import { InferClassValidatorSchema } from './class.schema.types';

describe('ClassSchema types', () => {
  class TestSchema {
    foo: string = 'bar';
    bar?: string;
  }

  describe('validated data', () => {
    it('should compile when the expected properties are provided', () => {
      expectTypeOf<InferClassValidatorSchema<typeof TestSchema, { validated: true }>>().toEqualTypeOf<{
        foo: string;
        bar?: string;
      }>();
    });

    it('should not compile when the schema is not a ClassSchema', () => {
      expectTypeOf<InferClassValidatorSchema<string, { validated: true }>>().toEqualTypeOf<never>();
    });

    it('should not compile when a property does not match the expected type', () => {
      // @ts-expect-error - Type 'number' is not assignable to type 'string'.
      expectTypeOf<InferClassValidatorSchema<typeof TestSchema, { validated: true }>>().toEqualTypeOf<{
        foo: number;
      }>();
    });
  });

  describe('unvalidated data', () => {
    /**
     * TODO: Support accessing defaulted properties when Typescript supports it.
     */
    it.skip('should keep the defaulted properties optional', () => {
      // @ts-expect-error - Type 'undefined' is not assignable to type 'string'.
      expectTypeOf<InferClassValidatorSchema<typeof TestSchema, { validated: false }>>().toEqualTypeOf<{
        foo?: string;
        bar?: string;
      }>();
    });
  });
});
