import { openai } from '@ai-sdk/openai';
import { InvalidToolArgumentsError, NoSuchToolError, streamText, tool, ToolExecutionError } from 'ai';
import { prisma } from '@/lib/prisma';
import { Tool } from '@/components/zod-schema-designer/types';
import { dbToolToAppTool, schemaToZod } from '@/lib/schema-conversions';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get all tools from the database
  const dbTools = await prisma.tool.findMany();

  // Convert database tools to our Tool type
  const tools: Tool[] = dbTools.map(dbToolToAppTool);

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