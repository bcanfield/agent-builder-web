import { z } from 'zod';

export type SchemaType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum' | 'union' | 'date' | 'file' | 'calculated';

export interface ValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: string;
  custom?: string;
  default?: string;
}

export interface CalculatedFieldOptions {
  dependencies: string[];
  formula: string;
}

export interface SchemaField {
  name: string;
  type: SchemaType;
  description?: string;
  label?: string;
  validations?: Record<string, any>;
  enumValues?: string[];
  children?: SchemaField[];
  calculatedField?: {
    dependencies: string[];
    formula: string;
  };
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: SchemaField;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, {
      description: string;
      type: string;
      required?: boolean;
      enum?: string[];
    }>;
  };
}

export type InitialSchema = SchemaField | z.ZodTypeAny;

export interface ZodSchemaDesignerProps {
  initialSchema: InitialSchema;
  onSave: (schema: SchemaField) => void;
  showGeneratedCode?: boolean;
}

