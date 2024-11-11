export type JSONSchemaTypeName = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';

export type JSONSchemaType = string | number | boolean | JSONSchemaObject | JSONSchemaArray | null;

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface JSONSchemaObject {
  [key: string]: JSONSchemaType;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface JSONSchemaArray extends Array<JSONSchemaType> {}

export type JSONSchemaVersion = string;

export type JSONSchemaDefinition = JSONSchemaDto | boolean;

export type JSONSchemaDto = Readonly<{
  type?: JSONSchemaTypeName | readonly JSONSchemaTypeName[] | undefined;
  enum?: unknown | undefined;
  const?: unknown | undefined;
  multipleOf?: number | undefined;
  maximum?: number | undefined;
  exclusiveMaximum?: number | undefined;
  minimum?: number | undefined;
  exclusiveMinimum?: number | undefined;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  format?: string | undefined;
  pattern?: string | undefined;
  items?: JSONSchemaDefinition | readonly JSONSchemaDefinition[] | undefined;
  additionalItems?: JSONSchemaDefinition | undefined;
  maxItems?: number | undefined;
  minItems?: number | undefined;
  uniqueItems?: boolean | undefined;
  contains?: JSONSchemaDefinition | undefined;
  maxProperties?: number | undefined;
  minProperties?: number | undefined;
  required?: readonly string[] | undefined;
  properties?:
    | Readonly<{
        [key: string]: JSONSchemaDefinition;
      }>
    | undefined;
  patternProperties?:
    | Readonly<{
        [key: string]: JSONSchemaDefinition;
      }>
    | undefined;
  additionalProperties?: JSONSchemaDefinition | undefined;
  dependencies?:
    | Readonly<{
        [key: string]: JSONSchemaDefinition | readonly string[];
      }>
    | undefined;
  propertyNames?: JSONSchemaDefinition | undefined;
  if?: JSONSchemaDefinition | undefined;
  then?: JSONSchemaDefinition | undefined;
  else?: JSONSchemaDefinition | undefined;
  allOf?: readonly JSONSchemaDefinition[] | undefined;
  anyOf?: readonly JSONSchemaDefinition[] | undefined;
  oneOf?: readonly JSONSchemaDefinition[] | undefined;
  not?: JSONSchemaDefinition | undefined;
  definitions?:
    | Readonly<{
        [key: string]: JSONSchemaDefinition;
      }>
    | undefined;
  title?: string | undefined;
  description?: string | undefined;
  default?: unknown | undefined;
  readOnly?: boolean | undefined;
  writeOnly?: boolean | undefined;
  examples?: readonly unknown[] | undefined;
}>;
