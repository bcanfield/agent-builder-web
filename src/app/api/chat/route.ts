import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
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

  // Convert tools to the format expected by the Vercel AI SDK
  const toolSet = tools.reduce((acc, dbTool) => {
    acc[dbTool.name] = tool({
      description: dbTool.description,
      parameters: toolToZodSchema(dbTool),
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

  return result.toDataStreamResponse();
}