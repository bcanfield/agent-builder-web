import { z } from 'zod';

export interface ToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
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
    let zodType: z.ZodType;
    
    switch (param.type) {
      case 'string':
        zodType = z.string();
        break;
      case 'number':
        zodType = z.number();
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      default:
        zodType = z.string();
    }
    
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