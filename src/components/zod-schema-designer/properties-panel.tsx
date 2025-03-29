import React from 'react'
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { Separator } from "@/components/shadcn/separator"
import { SchemaField, SchemaType } from './types'
import { ValidationEditor } from './validation-editor'

interface PropertiesPanelProps {
  field: SchemaField;
  onUpdate: (field: SchemaField) => void;
  onDelete: () => void;
  availableFields: string[];
}

export function PropertiesPanel({ field, onUpdate, onDelete, availableFields }: PropertiesPanelProps) {
  const handleChange = <K extends keyof SchemaField>(key: K, value: SchemaField[K]) => {
    const updatedField = { ...field, [key]: value };
    if (key === 'type') {
      updatedField.validations = {};
      updatedField.children = undefined;
      updatedField.enumValues = undefined;
      updatedField.calculatedField = undefined;
    }
    onUpdate(updatedField);
  };

  const handleCalculatedFieldChange = (dependencies?: string[], formula?: string) => {
    const updatedField = {
      ...field,
      calculatedField: {
        dependencies: dependencies || [],
        formula: formula || ''
      }
    };
    onUpdate(updatedField);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-4 hidden md:block">Properties</h2>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={field.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={field.type}
              onValueChange={(value) => handleChange('type', value as SchemaType)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="enum">Enum</SelectItem>
                <SelectItem value="array">Array</SelectItem>
                <SelectItem value="object">Object</SelectItem>
                <SelectItem value="calculated">Calculated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Input
              id="label"
              value={field.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={field.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="col-span-3"
            />
          </div>

          {field.type === 'enum' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enumValues" className="text-right">
                Values
              </Label>
              <Input
                id="enumValues"
                value={field.enumValues?.join(', ') || ''}
                onChange={(e) => handleChange('enumValues', e.target.value.split(',').map(v => v.trim()))}
                placeholder="value1, value2, value3"
                className="col-span-3"
              />
            </div>
          )}

          {field.type === 'calculated' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dependencies" className="text-right">
                  Dependencies
                </Label>
                <Select
                  value={field.calculatedField?.dependencies?.[0] || ''}
                  onValueChange={(value) => handleCalculatedFieldChange([value], field.calculatedField?.formula)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((fieldName) => (
                      <SelectItem key={fieldName} value={fieldName}>
                        {fieldName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="formula" className="text-right">
                  Formula
                </Label>
                <Input
                  id="formula"
                  value={field.calculatedField?.formula || ''}
                  onChange={(e) => handleCalculatedFieldChange(field.calculatedField?.dependencies, e.target.value)}
                  className="col-span-3"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Validations</h2>
        <ValidationEditor
          type={field.type}
          validations={field.validations || {}}
          onChange={(validations) => handleChange('validations', validations)}
        />
      </div>

      {field.name !== 'root' && (
        <>
          <Separator />
          <div className="flex justify-start">
            <Button variant="destructive" onClick={onDelete}>
              Delete Field
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

