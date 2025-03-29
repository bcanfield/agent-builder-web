import { z } from 'zod';

export interface ValidationOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface ToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
  validation?: ValidationOptions;
  properties?: Record<string, ToolParameter>; // For object type
  items?: ToolParameter; // For array type
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, ToolParameter>;
}

export interface Tool {
  id?: string;
  name: string;
  description: string;
  parameters: ToolParameters;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to convert our tool format to Zod schema
export function toolToZodSchema(tool: Tool) {
  const properties: Record<string, z.ZodType> = {};
  
  Object.entries(tool.parameters.properties).forEach(([key, param]) => {
    let zodType: z.ZodType = createZodType(param);
    
    if (param.description) {
      zodType = zodType.describe(param.description);
    }
    
    if (!param.required) {
      zodType = zodType.optional();
    }
    
    properties[key] = zodType;
  });
  
  return z.object(properties);
}

function createZodType(param: ToolParameter): z.ZodTypeAny {
  // Handle enum values first if they exist
  if (param.enum?.length) {
    const enumValues = param.enum.filter(Boolean);
    if (enumValues.length > 0) {
      return z.enum(enumValues as [string, ...string[]]);
    }
  }

  switch (param.type) {
    case 'string': {
      let zodType: z.ZodString = z.string();
      if (param.validation?.minLength !== undefined) {
        zodType = zodType.min(param.validation.minLength);
      }
      if (param.validation?.maxLength !== undefined) {
        zodType = zodType.max(param.validation.maxLength);
      }
      if (param.validation?.pattern) {
        zodType = zodType.regex(new RegExp(param.validation.pattern));
      }
      return zodType;
    }
      
    case 'number': {
      let zodType: z.ZodNumber = z.number();
      if (param.validation?.min !== undefined) {
        zodType = zodType.min(param.validation.min);
      }
      if (param.validation?.max !== undefined) {
        zodType = zodType.max(param.validation.max);
      }
      return zodType;
    }
      
    case 'boolean':
      return z.boolean();
      
    case 'array':
      if (!param.items) {
        throw new Error('Array type must specify items type');
      }
      return z.array(createZodType(param.items));
      
    case 'object':
      if (!param.properties) {
        throw new Error('Object type must specify properties');
      }
      return z.object(
        Object.entries(param.properties).reduce<Record<string, z.ZodTypeAny>>((acc, [key, value]) => {
          acc[key] = createZodType(value);
          return acc;
        }, {})
      );
      
    case 'date':
      return z.string().datetime();
      
    case 'email':
      return z.string().email();
      
    case 'url':
      return z.string().url();
      
    default:
      return z.string();
  }
} 