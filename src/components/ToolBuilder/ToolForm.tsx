'use client';

import { useState } from 'react';
import { Tool, ToolParameter } from '@/types/tool';
import { createTool } from '@/app/actions/tools';

interface ValidationError {
  field: string;
  message: string;
}

export function ToolForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<Record<string, ToolParameter>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);
    
    const tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description,
      parameters: {
        type: 'object',
        properties: parameters,
      },
    };

    const result = await createTool(tool);
    
    if ('error' in result) {
      setErrors(result.error);
    } else {
      // Reset form on success
      setName('');
      setDescription('');
      setParameters({});
    }
    
    setIsSubmitting(false);
  };

  const addParameter = () => {
    const paramName = prompt('Enter parameter name:');
    if (!paramName) return;

    setParameters(prev => ({
      ...prev,
      [paramName]: {
        type: 'string',
        description: '',
        required: false,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Tool Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.some(e => e.field === 'name')
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
          required
        />
        {errors.some(e => e.field === 'name') && (
          <p className="mt-1 text-sm text-red-600">
            {errors.find(e => e.field === 'name')?.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.some(e => e.field === 'description')
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
          required
        />
        {errors.some(e => e.field === 'description') && (
          <p className="mt-1 text-sm text-red-600">
            {errors.find(e => e.field === 'description')?.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Parameters</label>
        <button
          type="button"
          onClick={addParameter}
          className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Parameter
        </button>
        
        {Object.entries(parameters).map(([name, param]) => (
          <div key={name} className="mt-2 p-4 border rounded">
            <h4 className="font-medium">{name}</h4>
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={param.description}
                onChange={(e) => setParameters(prev => ({
                  ...prev,
                  [name]: { ...prev[name], description: e.target.value }
                }))}
                placeholder="Parameter description"
                className="block w-full rounded-md border-gray-300 shadow-sm"
              />
              <select
                value={param.type}
                onChange={(e) => setParameters(prev => ({
                  ...prev,
                  [name]: { ...prev[name], type: e.target.value }
                }))}
                className="block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={param.required}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    [name]: { ...prev[name], required: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <span className="ml-2">Required</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Tool'}
      </button>
    </form>
  );
} 