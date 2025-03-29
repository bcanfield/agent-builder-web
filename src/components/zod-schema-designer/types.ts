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
  children?: SchemaField[];
  enumValues?: string[];
  validations?: ValidationOptions;
  label?: string;
  calculatedField?: CalculatedFieldOptions;
}

export type InitialSchema = SchemaField | z.ZodTypeAny;

export interface ZodSchemaDesignerProps {
  initialSchema: InitialSchema;
  onSave: (schema: SchemaField) => void;
  showGeneratedCode?: boolean;
}

