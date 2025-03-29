import React from 'react'
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label"
import { Switch } from "@/components/shadcn/switch"
import { SchemaType, ValidationOptions } from './types'

interface ValidationEditorProps {
  type: SchemaType;
  validations: ValidationOptions;
  onChange: (validations: ValidationOptions) => void;
}

export function ValidationEditor({ type, validations, onChange }: ValidationEditorProps) {
  const handleChange = (key: keyof ValidationOptions, value: string | boolean | number | undefined) => {
    onChange({
      ...validations,
      [key]: value
    });
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="required"
          checked={validations.required !== false}
          onCheckedChange={(checked) => handleChange('required', checked)}
        />
        <Label htmlFor="required">Required</Label>
      </div>

      {(type === 'string' || type === 'number' || type === 'array') && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="min" className="text-right">
              Min
            </Label>
            <Input
              id="min"
              type={type === 'number' ? 'number' : 'text'}
              value={validations.min || ''}
              onChange={(e) => handleChange('min', type === 'number' ? Number(e.target.value) : e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max" className="text-right">
              Max
            </Label>
            <Input
              id="max"
              type={type === 'number' ? 'number' : 'text'}
              value={validations.max || ''}
              onChange={(e) => handleChange('max', type === 'number' ? Number(e.target.value) : e.target.value)}
              className="col-span-3"
            />
          </div>
        </>
      )}

      {type === 'string' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="regex" className="text-right">
            Regex
          </Label>
          <Input
            id="regex"
            value={validations.regex || ''}
            onChange={(e) => handleChange('regex', e.target.value)}
            className="col-span-3"
          />
        </div>
      )}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="default" className="text-right">
          Default
        </Label>
        <Input
          id="default"
          value={validations.default || ''}
          onChange={(e) => handleChange('default', e.target.value)}
          placeholder={type === 'date' ? 'YYYY-MM-DD' : ''}
          className="col-span-3"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="custom" className="text-right">
          Custom
        </Label>
        <Input
          id="custom"
          value={validations.custom || ''}
          onChange={(e) => handleChange('custom', e.target.value)}
          className="col-span-3"
        />
      </div>
    </div>
  );
}

