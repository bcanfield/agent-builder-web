'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/shadcn/button"
import { Copy, Check, Save, X } from 'lucide-react'
import { SchemaField, ZodSchemaDesignerProps } from './types'
import { SchemaFieldEditor } from './schema-field-editor'
import { PropertiesPanel } from './properties-panel'
import { generateZodSchema, zodToJson } from './schema-utils'
import { z } from 'zod'

export function ZodSchemaDesigner({ initialSchema, onSave, showGeneratedCode = true }: ZodSchemaDesignerProps) {
  const [schema, setSchema] = useState<SchemaField>(
    initialSchema instanceof z.ZodType ? zodToJson(initialSchema) : initialSchema
  );
  const [selectedField, setSelectedField] = useState<SchemaField | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newField, setNewField] = useState<SchemaField | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  useEffect(() => {
    setSchema(initialSchema instanceof z.ZodType ? zodToJson(initialSchema) : initialSchema);
    setSelectedField(null);
    setHasUnsavedChanges(false);
    setNewField(null);
  }, [initialSchema]);

  const getAllFieldNames = (field: SchemaField): string[] => {
    let names: string[] = [field.name];
    if (field.children) {
      names = names.concat(field.children.flatMap(getAllFieldNames));
    }
    return names;
  };

  const availableFields = getAllFieldNames(schema);

  const handleSave = () => {
    onSave(schema);
    setHasUnsavedChanges(false);
  };

  const handleSchemaUpdate = (updatedSchema: SchemaField) => {
    setSchema(updatedSchema);
    setHasUnsavedChanges(true);
  };

  const handleFieldUpdate = (updatedField: SchemaField) => {
    setSchema(prevSchema => {
      const updateFieldRecursive = (field: SchemaField): SchemaField => {
        if (field === selectedField) {
          return updatedField;
        }
        if (field.children) {
          return {
            ...field,
            children: field.children.map(updateFieldRecursive)
          };
        }
        return field;
      };
      return updateFieldRecursive(prevSchema);
    });
    setSelectedField(updatedField);
    setNewField(null);
    setHasUnsavedChanges(true);
  };

  const handleFieldDelete = () => {
    setSchema(prevSchema => {
      const deleteFieldRecursive = (field: SchemaField): SchemaField | null => {
        if (field === selectedField) {
          return null;
        }
        if (field.children) {
          const updatedChildren = field.children
            .map(deleteFieldRecursive)
            .filter((child): child is SchemaField => child !== null);
          return { ...field, children: updatedChildren };
        }
        return field;
      };
      const updatedSchema = deleteFieldRecursive(prevSchema);
      return updatedSchema || prevSchema;
    });
    setSelectedField(null);
    setShowPropertiesPanel(false);
    setHasUnsavedChanges(true);
  };

  const handleCopyCode = () => {
    const code = generateZodSchema(schema);
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleAddField = (newField: SchemaField) => {
    setSelectedField(newField);
    setNewField(newField);
    setShowPropertiesPanel(true);
  };

  return (
    <div className="flex h-full relative">
      <div className={`w-full md:w-2/3 overflow-auto transition-all ${showPropertiesPanel ? 'hidden md:block' : 'block'}`}>
        <div className="p-4">
          <SchemaFieldEditor
            field={schema}
            onUpdate={handleSchemaUpdate}
            onDelete={() => {}}
            depth={0}
            availableFields={availableFields}
            selectedField={selectedField}
            onSelectField={handleAddField}
            isNewField={newField === schema}
          />
        </div>
        {showGeneratedCode && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generated Zod Schema</h3>
              <Button onClick={handleCopyCode} className="flex items-center">
                {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{generateZodSchema(schema)}</code>
            </pre>
          </div>
        )}
      </div>
      {selectedField && (
        <div className={`fixed md:relative top-0 left-0 w-full md:w-1/3 h-full bg-white overflow-auto border-l transition-all ${showPropertiesPanel ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <h2 className="text-lg font-semibold">Properties</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowPropertiesPanel(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <PropertiesPanel
            field={selectedField}
            onUpdate={handleFieldUpdate}
            onDelete={handleFieldDelete}
            availableFields={availableFields}
          />
        </div>
      )}
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className="flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

