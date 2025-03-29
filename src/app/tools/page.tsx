import { ToolForm } from '@/components/ToolBuilder/ToolForm';
import { ToolList } from '@/components/ToolBuilder/ToolList';

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Tool Builder</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium mb-4">Create New Tool</h2>
          <ToolForm />
        </div>
        
        <div>
          <ToolList />
        </div>
      </div>
    </div>
  );
} 