import { openai } from '@ai-sdk/openai';
import { InvalidToolArgumentsError, NoSuchToolError, streamText, tool, ToolExecutionError } from 'ai';
import { prisma } from '@/lib/prisma';
import { toolToZodSchema, Tool, ToolParameters } from '@/types/tool';

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
    parameters: dbTool.parameters as unknown as ToolParameters,
    createdAt: dbTool.createdAt,
    updatedAt: dbTool.updatedAt,
  }));

  console.log({a: tools.map((t)=> t.parameters.properties)})

  // Convert tools to the format expected by the Vercel AI SDK
  const toolSet = tools.reduce((acc, dbTool) => {
    const paramSchema =  toolToZodSchema(dbTool)
    acc[dbTool.name] = tool({
      description: dbTool.description,
      parameters: paramSchema,
      execute: async (args) => args,
    });
    return acc;
  }, {} as Record<string, ReturnType<typeof tool>>);

  console.log({toolSet})

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