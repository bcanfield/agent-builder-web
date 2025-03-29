'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { SchemaField, Tool } from '@/components/zod-schema-designer/types';
import { prisma } from '@/lib/prisma';

const toolSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  parameters: z.any() as z.ZodType<SchemaField>
});

export type CreateToolInput = z.infer<typeof toolSchema>;

export async function createTool(input: CreateToolInput) {
  try {
    const validatedInput = toolSchema.parse(input);
    const tool = await prisma.tool.create({
      data: {
        name: validatedInput.name,
        description: validatedInput.description,
        parameters: validatedInput.parameters as object
      }
    });
    revalidatePath('/tools');
    return { success: true, tool };
  } catch (error) {
    console.error('Error creating tool:', error);
    return { success: false, error: 'Failed to create tool' };
  }
}

export async function getTools() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return tools;
  } catch (error) {
    console.error('Error getting tools:', error);
    return [];
  }
}

export async function deleteTool(id: string) {
  return prisma.tool.delete({
    where: { id },
  });
}

export async function updateTool(id: string, tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const validatedTool = toolSchema.parse(tool);
    
    return prisma.tool.update({
      where: { id },
      data: {
        name: validatedTool.name,
        description: validatedTool.description,
        parameters: validatedTool.parameters as object,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    throw error;
  }
}

export async function saveToolSchema(toolId: string, schema: SchemaField) {
  try {
    await prisma.tool.update({
      where: { id: toolId },
      data: {
        parameters: schema as object
      }
    });
    revalidatePath('/tools');
    return { success: true };
  } catch (error) {
    console.error('Error saving tool schema:', error);
    return { success: false, error: 'Failed to save schema' };
  }
}

export async function getToolSchema(toolId: string) {
  try {
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { parameters: true }
    });
    return tool?.parameters as SchemaField | null;
  } catch (error) {
    console.error('Error getting tool schema:', error);
    return null;
  }
} 