import { SchemaField, Tool } from '@/components/zod-schema-designer/types';
import { z } from 'zod';
import { Prisma } from '../../generated/prisma';

/**
 * Converts a database tool to our application Tool type
 */
export function dbToolToAppTool(dbTool: {
  id: string;
  name: string;
  description: string;
  parameters: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): Tool {
  return {
    id: dbTool.id,
    name: dbTool.name,
    description: dbTool.description,
    parameters: dbTool.parameters as unknown as SchemaField,
    createdAt: dbTool.createdAt,
    updatedAt: dbTool.updatedAt,
  };
}

/**
 * Converts a SchemaField to a Zod schema
 */
export function schemaToZod(schema: SchemaField): z.ZodType {
  switch (schema.type) {
    case 'string':
      return z.string();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'array':
      if (!schema.children?.[0]) {
        return z.array(z.any());
      }
      return z.array(schemaToZod(schema.children[0]));
    case 'object':
      if (!schema.children) {
        return z.record(z.any());
      }
      const shape: Record<string, z.ZodType> = {};
      for (const child of schema.children) {
        shape[child.name] = schemaToZod(child);
      }
      return z.object(shape);
    case 'enum':
      if (!schema.enumValues) {
        return z.string();
      }
      return z.enum(schema.enumValues as [string, ...string[]]);
    case 'union':
      if (!schema.children || schema.children.length < 2) {
        return z.any();
      }
      return z.union([schemaToZod(schema.children[0]), schemaToZod(schema.children[1])]);
    case 'date':
      return z.date();
    case 'file':
      return z.any(); // Handle file type appropriately
    case 'calculated':
      return z.any(); // Handle calculated type appropriately
    default:
      return z.any();
  }
} 