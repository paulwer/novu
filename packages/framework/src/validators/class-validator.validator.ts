import { ValidationError } from 'class-validator';
import type { ClassType, FromSchema, FromSchemaUnvalidated, JsonSchema, Schema } from '../types/schema.types';
import type { ValidateResult, Validator } from '../types/validator.types';

// Function to recursively add `additionalProperties: false` to the schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replaceSchemaRefs(schema: any, schemas: any): JsonSchema {
  if (schema && typeof schema === 'object' && schema?.$ref) {
    // eslint-disable-next-line no-param-reassign
    schema = schemas[schema.$ref.split('/').at(-1)];
  }

  if (schema && typeof schema === 'object')
    for (const key in schema) {
      if (schema.hasOwnProperty(key)) {
        // eslint-disable-next-line no-param-reassign
        schema[key] = replaceSchemaRefs(schema[key], schemas);
      }
    }

  return schema;
}
// Function to recursively add `additionalProperties: false` to the schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addAdditionalPropertiesFalse(schema: any): JsonSchema {
  if (schema && typeof schema === 'object' && schema?.type === 'object') {
    // eslint-disable-next-line no-param-reassign
    schema.additionalProperties = false;
  }

  if (schema.properties) {
    for (const key in schema.properties) {
      if (schema.properties.hasOwnProperty(key)) {
        addAdditionalPropertiesFalse(schema.properties[key]);
      }
    }
  }

  return schema;
}
function formatErrors(errors: ValidationError[], parentPath = ''): { path: string; message: string }[] {
  return errors.flatMap((err) => {
    const currentPath = `${parentPath}/${err.property}`.replace(/\/+/g, '/');

    if (err.children && err.children.length > 0) {
      // Recursively format the children
      return formatErrors(err.children, currentPath);
    } else {
      // Base case: no children, return the formatted error
      return {
        path: currentPath,
        message: Object.values(err.constraints || {}).join(', '),
      };
    }
  });
}

export class ClassValidatorValidator implements Validator<ClassType> {
  canHandle(schema: Schema): schema is ClassType {
    return typeof (schema as ClassType) === 'function';
  }

  async validate<
    T_Schema extends ClassType = ClassType,
    T_Unvalidated = FromSchemaUnvalidated<T_Schema>,
    T_Validated = FromSchema<T_Schema>,
  >(data: T_Unvalidated, schema: T_Schema): Promise<ValidateResult<T_Validated>> {
    try {
      await import('reflect-metadata');
      const { plainToInstance, instanceToPlain } = await import('class-transformer');
      const { validate } = await import('class-validator');

      // Convert plain data to an instance of the schema class
      const instance = plainToInstance(schema, data);

      // Validate the instance
      const errors = await validate(instance as object, { whitelist: true });

      // if undefined, then something went wrong
      if (!instance && !!data) throw new Error('Failed to convert data to an instance of the schema class');

      if (errors.length === 0) {
        return { success: true, data: instanceToPlain(instance) as T_Validated };
      } else {
        return {
          success: false,
          errors: formatErrors(errors),
        };
      }
    } catch (error) {
      if ((error as Error)?.message?.includes('Cannot find module')) {
        throw new Error(
          'Tried to use a class-validator schema in @novu/framework without `class-validator`, `class-transformer` or `reflect-metadata` installed. ' +
            'Please install it by running `npm install class-validator class-transformer reflect-metadata`.'
        );
      }
      throw error;
    }
  }

  async transformToJsonSchema(schema: ClassType): Promise<JsonSchema> {
    try {
      // eslint-disable-next-line global-require
      const { defaultMetadataStorage } = require('class-transformer/cjs/storage');
      const { getMetadataStorage } = await import('class-validator');
      const { targetConstructorToSchema, validationMetadatasToSchemas } = await import('class-validator-jsonschema');

      const schemas = validationMetadatasToSchemas({
        classValidatorMetadataStorage: getMetadataStorage(),
        classTransformerMetadataStorage: defaultMetadataStorage,
      });

      return addAdditionalPropertiesFalse(
        replaceSchemaRefs(
          targetConstructorToSchema(schema, {
            classValidatorMetadataStorage: getMetadataStorage(),
            classTransformerMetadataStorage: defaultMetadataStorage,
          }),
          schemas
        )
      );
    } catch (error) {
      if ((error as Error)?.message?.includes('Cannot find module')) {
        // eslint-disable-next-line no-console
        console.error(
          'Tried to use a class-validator schema in @novu/framework without `class-validator-jsonschema` installed. ' +
            'Please install it by running `npm install class-validator-jsonschema`.'
        );
      }
      throw error;
    }
  }
}
