'use client';

import { useState } from 'react';
import { Tool, ToolParameter } from '@/types/tool';
import { createTool } from '@/app/actions/tools';
import { ParameterBuilder } from './ParameterBuilder';

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

  const handleParameterChange = (name: string, value: ToolParameter) => {
    setParameters(prev => ({
      ...prev,
      [name]: value,
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
          <ParameterBuilder
            key={name}
            name={name}
            value={param}
            onChange={handleParameterChange}
          />
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