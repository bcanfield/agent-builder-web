'use server';

import { prisma } from '@/lib/prisma';
import { Tool } from '@/types/tool';
import { z } from 'zod';

const toolSchema = z.object({
  name: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Tool name can only contain letters, numbers, underscores, and hyphens')
    .min(1, 'Tool name is required'),
  description: z.string().min(1, 'Description is required'),
  parameters: z.object({
    type: z.literal('object'),
    properties: z.record(z.object({
      type: z.string(),
      description: z.string(),
      required: z.boolean().optional(),
      enum: z.array(z.string()).optional(),
    })),
  }),
});

export async function createTool(tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const validatedTool = toolSchema.parse(tool);
    
    return prisma.tool.create({
      data: {
        name: validatedTool.name,
        description: validatedTool.description,
        parameters: validatedTool.parameters,
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

export async function getTools() {
  return prisma.tool.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
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
        parameters: validatedTool.parameters,
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