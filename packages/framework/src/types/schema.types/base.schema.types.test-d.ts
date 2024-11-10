import { describe, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { FromSchema, FromSchemaUnvalidated } from './base.schema.types';

describe('FromSchema', () => {
  it('should infer an unknown record type when no schema is provided', () => {
    expectTypeOf<FromSchema<{}>>().toEqualTypeOf<Record<string, unknown>>();
  });

  it('should infer a Json Schema type', () => {
    const testJsonSchema = {
      type: 'object',
      properties: {
        foo: { type: 'string', default: 'bar' },
        bar: { type: 'string' },
      },
      additionalProperties: false,
    } as const;

    expectTypeOf<FromSchema<typeof testJsonSchema>>().toEqualTypeOf<{ foo: string; bar?: string }>();
  });

  it('should infer a Zod Schema type', () => {
    const testZodSchema = z.object({
      foo: z.string().default('bar'),
      bar: z.string().optional(),
    });

    expectTypeOf<FromSchema<typeof testZodSchema>>().toEqualTypeOf<{ foo: string; bar?: string }>();
  });
});

describe('FromSchemaUnvalidated', () => {
  it('should infer an unknown record type when no schema is provided', () => {
    expectTypeOf<FromSchemaUnvalidated<{}>>().toEqualTypeOf<Record<string, unknown>>();
  });

  it('should infer a Json Schema type', () => {
    const testJsonSchema = {
      type: 'object',
      properties: {
        foo: { type: 'string', default: 'bar' },
        bar: { type: 'string' },
      },
      additionalProperties: false,
    } as const;

    expectTypeOf<FromSchemaUnvalidated<typeof testJsonSchema>>().toEqualTypeOf<{ foo?: string; bar?: string }>();
  });

  it('should infer a Zod Schema type', () => {
    const testZodSchema = z.object({
      foo: z.string().default('bar'),
      bar: z.string().optional(),
    });

    expectTypeOf<FromSchemaUnvalidated<typeof testZodSchema>>().toEqualTypeOf<{ foo?: string; bar?: string }>();
  });
});
