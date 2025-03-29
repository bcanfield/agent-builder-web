import { openai } from '@ai-sdk/openai';
import { InvalidToolArgumentsError, NoSuchToolError, streamText, tool, ToolExecutionError } from 'ai';
import { prisma } from '@/lib/prisma';
import { SchemaField, Tool } from '@/components/zod-schema-designer/types';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get all tools from the database
  const dbTools = await prisma.tool.findMany();

  // Convert database tools to our Tool type
  const tools: Tool[] = dbTools.map(dbTool => ({
    id: dbTool.id,
    name: dbTool.name,
    description: dbTool.description,
    parameters: dbTool.parameters as unknown as SchemaField,
    createdAt: dbTool.createdAt,
    updatedAt: dbTool.updatedAt,
  }));

  // Convert tools to the format expected by the Vercel AI SDK
  const toolSet = tools.reduce((acc, dbTool) => {
    const paramSchema = schemaToZod(dbTool.parameters);
    acc[dbTool.name] = tool({
      description: dbTool.description,
      parameters: paramSchema,
      execute: async (args) => args,
    }) as any; // Type assertion needed due to Vercel AI SDK type mismatch
    return acc;
  }, {} as Record<string, ReturnType<typeof tool>>);

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: toolSet,
    onError: (event) => {
      console.log({event})
    }
  });

  return result.toDataStreamResponse({
    getErrorMessage: error => {
      if (NoSuchToolError.isInstance(error)) {
        return 'The model tried to call a unknown tool.';
      } else if (InvalidToolArgumentsError.isInstance(error)) {
        return 'The model called a tool with invalid arguments.';
      } else if (ToolExecutionError.isInstance(error)) {
        return 'An error occurred during tool execution.';
      } else {
        return 'An unknown error occurred.';
      }
    },
  });
}

function schemaToZod(schema: SchemaField): z.ZodType {
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