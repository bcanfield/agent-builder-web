import React from 'react'
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select"
import { Trash } from 'lucide-react'
import { CalculatedFieldOptions } from './types'

interface CalculatedFieldEditorProps {
  calculatedField: CalculatedFieldOptions;
  onChange: (calculatedField: CalculatedFieldOptions) => void;
  availableFields: string[];
}

export const CalculatedFieldEditor: React.FC<CalculatedFieldEditorProps> = ({ calculatedField, onChange, availableFields }) => {
  const handleDependencyChange = (index: number, value: string) => {
    const newDependencies = [...calculatedField.dependencies];
    newDependencies[index] = value;
    onChange({ ...calculatedField, dependencies: newDependencies });
  };

  const handleAddDependency = () => {
    onChange({ ...calculatedField, dependencies: [...calculatedField.dependencies, ''] });
  };

  const handleRemoveDependency = (index: number) => {
    const newDependencies = calculatedField.dependencies.filter((_, i) => i !== index);
    onChange({ ...calculatedField, dependencies: newDependencies });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Dependencies</Label>
        {calculatedField.dependencies.map((dep, index) => (
          <div key={index} className="flex items-center mt-2">
            <Select value={dep} onValueChange={(value) => handleDependencyChange(index, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => handleRemoveDependency(index)} className="ml-2">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddDependency} className="mt-2">
          Add Dependency
        </Button>
      </div>
      <div>
        <Label htmlFor="formula">Formula</Label>
        <Input
          id="formula"
          value={calculatedField.formula}
          onChange={(e) => onChange({ ...calculatedField, formula: e.target.value })}
          placeholder="e.g., (a, b) => a + b"
        />
      </div>
    </div>
  );
};

