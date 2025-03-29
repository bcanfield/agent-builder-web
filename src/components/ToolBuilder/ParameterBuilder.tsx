'use client';

import { useState } from 'react';
import { ToolParameter } from '@/types/tool';

interface ParameterBuilderProps {
  name: string;
  value: ToolParameter;
  onChange: (name: string, value: ToolParameter) => void;
}

export function ParameterBuilder({ name, value, onChange }: ParameterBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeChange = (type: string) => {
    onChange(name, {
      ...value,
      type,
      // Reset validation options when type changes
      validation: undefined,
    });
  };

  const handleValidationChange = (key: string, val: any) => {
    onChange(name, {
      ...value,
      validation: {
        ...value.validation,
        [key]: val,
      },
    });
  };

  return (
    <div className="mt-2 p-4 border rounded">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{name}</h4>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      <div className="mt-2 space-y-2">
        <input
          type="text"
          value={value.description}
          onChange={(e) => onChange(name, { ...value, description: e.target.value })}
          placeholder="Parameter description"
          className="block w-full rounded-md border-gray-300 shadow-sm"
        />

        <select
          value={value.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="array">Array</option>
          <option value="object">Object</option>
          <option value="date">Date</option>
          <option value="email">Email</option>
          <option value="url">URL</option>
        </select>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={value.required}
            onChange={(e) => onChange(name, { ...value, required: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600"
          />
          <span className="ml-2">Required</span>
        </label>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Type-specific validation options */}
            {value.type === 'string' && (
              <>
                <div>
                  <label className="block text-sm font-medium">Min Length</label>
                  <input
                    type="number"
                    value={value.validation?.minLength || ''}
                    onChange={(e) => handleValidationChange('minLength', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Max Length</label>
                  <input
                    type="number"
                    value={value.validation?.maxLength || ''}
                    onChange={(e) => handleValidationChange('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Pattern (Regex)</label>
                  <input
                    type="text"
                    value={value.validation?.pattern || ''}
                    onChange={(e) => handleValidationChange('pattern', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            {value.type === 'number' && (
              <>
                <div>
                  <label className="block text-sm font-medium">Min Value</label>
                  <input
                    type="number"
                    value={value.validation?.min || ''}
                    onChange={(e) => handleValidationChange('min', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Max Value</label>
                  <input
                    type="number"
                    value={value.validation?.max || ''}
                    onChange={(e) => handleValidationChange('max', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            {/* Enum values for any type */}
            <div>
              <label className="block text-sm font-medium">Enum Values (one per line)</label>
              <textarea
                value={value.enum?.join('\n') || ''}
                onChange={(e) => onChange(name, {
                  ...value,
                  enum: e.target.value.split('\n').filter(Boolean),
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Optional"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 