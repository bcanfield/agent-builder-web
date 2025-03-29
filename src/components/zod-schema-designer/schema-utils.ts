import { SchemaField, SchemaType, ValidationOptions } from './types'
import { z } from 'zod'

export const getSimpleValidationView = (type: SchemaType, validations?: ValidationOptions): string => {
  if (!validations) return ''
  const parts = []
  if (validations.required) parts.push('required')
  if (validations.min !== undefined) parts.push(`min: ${validations.min}`)
  if (validations.max !== undefined) parts.push(`max: ${validations.max}`)
  if (validations.regex) parts.push('regex')
  if (validations.custom) parts.push('custom')
  return parts.join(', ')
}

export const generateZodSchema = (field: SchemaField): string => {
  const generateField = (f: SchemaField): string => {
    let schema = `z.${f.type}()`;
    
    if (f.type === 'number' || f.type === 'date') {
      schema = `z.coerce.${f.type}()`;
    }

    if (f.validations) {
      if (f.validations.required === false) schema += '.optional()';
      if (f.validations.min !== undefined) schema += `.min(${f.validations.min})`;
      if (f.validations.max !== undefined) schema += `.max(${f.validations.max})`;
      if (f.validations.regex) schema += `.regex(/${f.validations.regex}/)`;
      if (f.validations.custom) schema += `.refine(${f.validations.custom})`;
      if (f.validations.default) {
        const defaultValue = f.type === 'string' ? `"${f.validations.default}"` : f.validations.default;
        schema += `.default(${defaultValue})`;
      }
    }

    if (f.type === 'enum' && f.enumValues) {
      schema = `z.enum([${f.enumValues.map(v => `'${v}'`).join(', ')}])`;
    }

    if (f.type === 'object' && f.children) {
      const childSchemas = f.children.map(child => `${child.name}: ${generateField(child)}`).join(',\n    ');
      schema = `z.object({\n    ${childSchemas}\n  })`;
    }

    if (f.type === 'array' && f.children && f.children.length > 0) {
      schema = `z.array(${generateField(f.children[0])})`;
    }

    if (f.type === 'calculated') {
      schema = `z.function().implement((${f.calculatedField?.dependencies.join(', ')}) => ${f.calculatedField?.formula})`;
    }

    if (f.label || f.description) {
      const describeArgs = [];
      if (f.label) describeArgs.push(`"${f.label}"`);
      if (f.description) describeArgs.push(`"${f.description}"`);
      schema += `.describe(${describeArgs.join(', ')})`;
    }

    return schema;
  };

  return `import { z } from 'zod';

const ${field.name}Schema = ${generateField(field)};

export default ${field.name}Schema;`;
}

export const zodToJson = (zodSchema: z.ZodTypeAny): SchemaField => {
  const processZodType = (zodType: z.ZodTypeAny, name: string = 'root'): SchemaField => {
    const field: SchemaField = { name, type: 'string' };

    if (zodType instanceof z.ZodObject) {
      field.type = 'object';
      field.children = Object.entries(zodType.shape).map(([key, value]) => 
        processZodType(value as z.ZodTypeAny, key)
      );
    } else if (zodType instanceof z.ZodArray) {
      field.type = 'array';
      field.children = [processZodType(zodType.element, 'item')];
    } else if (zodType instanceof z.ZodEnum) {
      field.type = 'enum';
      field.enumValues = zodType._def.values;
    } else if (zodType instanceof z.ZodNumber) {
      field.type = 'number';
    } else if (zodType instanceof z.ZodBoolean) {
      field.type = 'boolean';
    } else if (zodType instanceof z.ZodDate) {
      field.type = 'date';
    }

    field.validations = {};
    if (zodType.isOptional()) {
      field.validations.required = false;
    }

    if (zodType instanceof z.ZodNumber) {
      if ('minimum' in zodType._def) field.validations.min = zodType._def.minimum as number;
      if ('maximum' in zodType._def) field.validations.max = zodType._def.maximum as number;
    }
    
    if (zodType instanceof z.ZodString && 'regex' in zodType._def) {
      field.validations.regex = (zodType._def.regex as RegExp).source;
    }

    return field;
  };

  return processZodType(zodSchema);
};

