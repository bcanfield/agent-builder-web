'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/shadcn/button"
import { Plus } from 'lucide-react'
import { SchemaField, Tool } from '@/components/zod-schema-designer/types'
import { ZodSchemaDesigner } from '@/components/zod-schema-designer/zod-schema-designer'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/shadcn/sidebar"
import { Input } from "@/components/shadcn/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/shadcn/dialog"
import { Label } from "@/components/shadcn/label"
import { saveToolSchema, getToolSchema, createTool, getTools } from '@/app/actions/tools'
import { toast } from 'sonner'

export default function ZodSchemaShowcase() {
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const [activeTool, setActiveTool] = useState<string>('');
  const [newToolName, setNewToolName] = useState('');
  const [isNewToolDialogOpen, setIsNewToolDialogOpen] = useState(false);

  useEffect(() => {
    // Load initial tools from the database
    loadTools();
  }, []);

  const loadTools = async () => {
    const toolsList = await getTools();
    const toolsMap = toolsList.reduce<Record<string, Tool>>((acc: Record<string, Tool>, tool: Tool) => {
      acc[tool.id] = tool;
      return acc;
    }, {});
    setTools(toolsMap);
  };

  const handleSave = async (updatedSchema: SchemaField) => {
    if (!activeTool) return;
    
    const result = await saveToolSchema(activeTool, updatedSchema);
    if (result.success) {
      toast.success("Schema saved successfully");
    } else {
      toast.error("Failed to save schema");
    }
  };

  const handleToolChange = async (toolId: string) => {
    setActiveTool(toolId);
    const schema = await getToolSchema(toolId);
    if (schema) {
      setTools(prev => ({
        ...prev,
        [toolId]: {
          ...prev[toolId],
          parameters: schema
        }
      }));
    }
  };

  const handleCreateNewTool = async () => {
    if (newToolName.trim() !== '') {
      const result = await createTool({
        name: newToolName,
        description: '',
        parameters: {
          name: newToolName,
          type: 'object',
          children: []
        }
      });

      if (result.success) {
        setTools(prev => ({
          ...prev,
          [result.tool.id]: result.tool
        }));
        setActiveTool(result.tool.id);
        setNewToolName('');
        setIsNewToolDialogOpen(false);
        toast.success("Tool created successfully");
      } else {
        toast.error("Failed to create tool");
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="flex-shrink-0">
          <SidebarHeader>
            <h2 className="text-xl font-bold p-4">Zod Schema Designer</h2>
          </SidebarHeader>
          <SidebarContent className="flex flex-col h-[calc(100vh-4rem)]">
            <SidebarMenu className="px-4 flex-grow">
              {Object.keys(tools).map((toolId) => (
                <SidebarMenuItem key={toolId}>
                  <SidebarMenuButton
                    onClick={() => handleToolChange(toolId)}
                    isActive={activeTool === toolId}
                  >
                    {tools[toolId].name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <Dialog open={isNewToolDialogOpen} onOpenChange={setIsNewToolDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      New Tool
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Tool</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newToolName}
                          onChange={(e) => setNewToolName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateNewTool}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex-grow overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold ml-4">
                  {activeTool ? tools[activeTool]?.name : 'Select a Tool'}
                </h1>
              </div>
            </div>
            <div className="flex-grow overflow-auto">
              {activeTool && tools[activeTool] ? (
                <ZodSchemaDesigner
                  key={activeTool}
                  initialSchema={tools[activeTool].parameters}
                  onSave={handleSave}
                  showGeneratedCode={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a tool or create a new one to start designing your schema
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

