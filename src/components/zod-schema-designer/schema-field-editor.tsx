import React, { useRef, useEffect } from 'react'
import { Button } from "@/components/shadcn/button"
import { Badge } from "@/components/shadcn/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadcn/tooltip"
import { ChevronDown, Plus, HelpCircle } from 'lucide-react'
import { SchemaField } from './types'
import { getSimpleValidationView } from './schema-utils'

interface SchemaFieldEditorProps {
  field: SchemaField;
  onUpdate: (updatedField: SchemaField) => void;
  onDelete: () => void;
  depth: number;
  availableFields: string[];
  selectedField: SchemaField | null;
  onSelectField: (field: SchemaField) => void;
  isNewField?: boolean;
}

export const SchemaFieldEditor: React.FC<SchemaFieldEditorProps> = ({ 
  field, 
  onUpdate, 
  depth, 
  availableFields, 
  selectedField, 
  onSelectField,
  isNewField
}) => {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNewField && fieldRef.current) {
      fieldRef.current.scrollIntoView({ behavior: 'smooth' });
      onSelectField(field);
    }
  }, [isNewField, field, onSelectField]);

  const handleAddChild = () => {
    const newChild: SchemaField = { name: 'New Field', type: 'string' }
    const updatedChildren = [...(field.children || []), newChild]
    onUpdate({ ...field, children: updatedChildren })
    onSelectField(newChild)
  }

  const handleUpdateChild = (index: number, updatedChild: SchemaField) => {
    const updatedChildren = [...(field.children || [])]
    updatedChildren[index] = updatedChild
    onUpdate({ ...field, children: updatedChildren })
  }

  const handleDeleteChild = (index: number) => {
    const updatedChildren = (field.children || []).filter((_, i) => i !== index)
    onUpdate({ ...field, children: updatedChildren })
  }

  return (
    <div 
      id={`field-${field.name}`} 
      ref={fieldRef}
      className={`mt-2 ${depth > 0 ? 'ml-4' : ''}`}
    >
      <div
        className={`flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded ${
          selectedField === field ? 'bg-gray-100' : ''
        }`}
        onClick={() => onSelectField(field)}
      >
        {(field.type === 'object' || field.type === 'array') && (
          <ChevronDown className="w-4 h-4 mr-1 -ml-4" />
        )}
        <span className="font-semibold">{field.name}</span>
        <Badge variant="secondary" className="ml-2">{field.type}</Badge>
        {field.validations && (
          <span className="ml-2 text-sm text-gray-500">
            {getSimpleValidationView(field.type, field.validations)}
          </span>
        )}
        {field.type === 'enum' && (
          <span className="ml-2 text-sm text-gray-500">
            [{field.enumValues?.join(', ')}]
          </span>
        )}
        {field.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{field.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {(field.type === 'object' || field.type === 'array') && (
        <div className="mt-2 ml-4">
          {field.children?.map((child, index) => (
            <SchemaFieldEditor
              key={index}
              field={child}
              onUpdate={(updatedChild) => handleUpdateChild(index, updatedChild)}
              onDelete={() => handleDeleteChild(index)}
              depth={depth + 1}
              availableFields={availableFields}
              selectedField={selectedField}
              onSelectField={onSelectField}
              isNewField={child.name === 'New Field'}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddChild}
            className="mt-2 ml-4 border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" /> Add {field.type === 'array' ? 'Item' : 'Field'}
          </Button>
        </div>
      )}
    </div>
  )
}

