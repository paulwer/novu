import type { JSONSchema, FromSchema as JsonSchemaInfer } from 'json-schema-to-ts';

/**
 * A JSON schema.
 */
export type JsonSchema = Exclude<JSONSchema, boolean>;

/**
 * Infer the data type of a JsonSchema.
 *
 * @param T - The `JsonSchema` to infer the data type of.
 * @param Options - Configuration options for the type inference. The `validated` flag determines whether the schema has been validated. If `validated` is true, all properties are required unless specified otherwise. If false, properties with default values are optional.
 *
 * @returns The inferred type.
 *
 * @example
 * ```ts
 * const mySchema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string' },
 *     email: { type: 'string' },
 *   },
 *   required: ['name'],
 *   additionalProperties: false,
 * } as const satisfies JsonSchema;
 *
 * // has type { name: string, email?: string }
 * type MySchema = InferJsonSchema<typeof mySchema, { validated: true }>;
 * ```
 */
export type InferJsonSchema<T, Options extends { validated: boolean }> = T extends JsonSchema
  ? Options['validated'] extends true
    ? JsonSchemaInfer<T>
    : JsonSchemaInfer<T, { keepDefaultedPropertiesOptional: true }>
  : never;
