import type { JSONSchema, FromSchema as JsonSchemaInfer } from 'json-schema-to-ts';
import zod from 'zod';

export type JsonSchema = JSONSchema;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType<T = any> = new (...args: any[]) => T;

/**
 * A schema used to validate a JSON object.
 *
 * Supported schemas:
 * - JSONSchema
 * - ZodSchema
 */
export type Schema = JsonSchema | zod.ZodSchema | ClassType;

/**
 * Infer the type of a Schema for unvalidated data.
 *
 * The resulting type has default properties set to optional,
 * reflecting the fact that the data is unvalidated and has
 * not had default properties set.
 *
 * @example
 * ```ts
 * type MySchema = FromSchemaUnvalidated<typeof mySchema>;
 * ```
 */
export type FromSchemaUnvalidated<T extends Schema> =
  /*
   * Handle each Schema's type inference individually until
   * all Schema types are exhausted.
   */

  // JSONSchema
  T extends JSONSchema
    ? JsonSchemaInfer<T, { keepDefaultedPropertiesOptional: true }>
    : // ZodSchema
      T extends zod.ZodSchema
      ? zod.input<T>
      : // ClassValidatorSchema
        T extends ClassType<infer U>
        ? U
        : // All schema types exhausted.
          never;

/**
 * Infer the type of a Schema for validated data.
 *
 * The resulting type has default properties set to required,
 * reflecting the fact that the data has been validated and
 * default properties have been set.
 *
 * @example
 * ```ts
 * type MySchema = FromSchema<typeof mySchema>;
 * ```
 */
export type FromSchema<T extends Schema> =
  /*
   * Handle each Schema's type inference individually until
   * all Schema types are exhausted.
   */

  // JSONSchema
  T extends JSONSchema
    ? JsonSchemaInfer<T>
    : // ZodSchema
      T extends zod.ZodSchema
      ? zod.infer<T>
      : // ClassValidatorSchema
        T extends ClassType<infer U>
        ? U
        : // All schema types exhausted.
          never;
