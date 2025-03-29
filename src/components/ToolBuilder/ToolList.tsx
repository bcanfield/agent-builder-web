'use client';

import { useEffect, useState } from 'react';
import { Tool } from '@/types/tool';
import { getTools, deleteTool } from '@/app/actions/tools';

export function ToolList() {
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    const tools = await getTools();
    setTools(tools);
  };

  const handleDelete = async (id: string) => {
    await deleteTool(id);
    loadTools();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Available Tools</h2>
      <div className="grid gap-4">
        {tools.map((tool) => (
          <div key={tool.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{tool.name}</h3>
                <p className="text-sm text-gray-500">{tool.description}</p>
              </div>
              <button
                onClick={() => handleDelete(tool.id!)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium">Parameters:</h4>
              <div className="mt-2 space-y-2">
                {Object.entries(tool.parameters.properties).map(([name, param]) => (
                  <div key={name} className="text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-gray-500"> ({param.type})</span>
                    {param.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                    <p className="text-gray-500">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 