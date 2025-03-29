'use client'

import React, { useState } from 'react'
import { Button } from "@/components/shadcn/button"
import { Plus } from 'lucide-react'
import { SchemaField } from '@/components/zod-schema-designer/types'
import { ZodSchemaDesigner } from '@/components/zod-schema-designer/zod-schema-designer'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/shadcn/sidebar"
import { Input } from "@/components/shadcn/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/shadcn/dialog"
import { Label } from "@/components/shadcn/label"

const sampleCollections = {
  users: {
    name: 'Users',
    type: 'object',
    children: [
      { name: 'id', type: 'string', validations: { required: true }, description: 'Unique identifier for the user' },
      { name: 'username', type: 'string', validations: { required: true, min: 3, max: 20 }, description: 'Unique username for the user' },
      { name: 'email', type: 'string', validations: { required: true, regex: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' }, description: 'Email address' },
      { name: 'password', type: 'string', validations: { required: true, min: 8 }, description: 'User password (min 8 characters)' },
      { name: 'age', type: 'number', validations: { min: 13 }, description: 'User age (must be at least 13)' },
      { name: 'isActive', type: 'boolean', validations: { required: true }, description: 'Active status' },
      { name: 'role', type: 'enum', enumValues: ['user', 'admin', 'moderator'], validations: { required: true }, description: 'User role in the system' },
      { name: 'lastLogin', type: 'date', description: 'Last login timestamp' },
      {
        name: 'profile',
        type: 'object',
        children: [
          { name: 'fullName', type: 'string', validations: { required: true }, description: 'Full name of the user' },
          { name: 'bio', type: 'string', validations: { max: 500 }, description: 'User biography (max 500 characters)' },
          { name: 'avatarUrl', type: 'string', validations: { regex: '^https?://.*$' }, description: 'URL to user\'s avatar image' },
        ]
      },
      {
        name: 'socialMedia',
        type: 'array',
        children: [{
          name: 'account',
          type: 'object',
          children: [
            { name: 'platform', type: 'enum', enumValues: ['twitter', 'facebook', 'instagram', 'linkedin'], validations: { required: true } },
            { name: 'username', type: 'string', validations: { required: true } },
            { name: 'url', type: 'string', validations: { regex: '^https?://.*$' } },
          ]
        }],
        description: 'List of user\'s social media accounts'
      },
    ]
  },
  products: {
    name: 'Products',
    type: 'object',
    children: [
      { name: 'id', type: 'string', validations: { required: true }, description: 'Unique identifier for the product' },
      { name: 'name', type: 'string', validations: { required: true, min: 2, max: 100 }, description: 'Product name' },
      { name: 'description', type: 'string', validations: { max: 1000 }, description: 'Detailed product description' },
      { name: 'price', type: 'number', validations: { required: true, min: 0 }, description: 'Product price in cents' },
      { name: 'category', type: 'enum', enumValues: ['electronics', 'clothing', 'books', 'home', 'other'], validations: { required: true }, description: 'Product category' },
      { name: 'tags', type: 'array', children: [{ name: 'tag', type: 'string' }], description: 'Product tags for easy searching' },
      { name: 'inStock', type: 'boolean', validations: { required: true }, description: 'Whether the product is in stock' },
      { name: 'createdAt', type: 'date', validations: { required: true }, description: 'Product creation date' },
      {
        name: 'dimensions',
        type: 'object',
        children: [
          { name: 'width', type: 'number', validations: { required: true, min: 0 }, description: 'Width in centimeters' },
          { name: 'height', type: 'number', validations: { required: true, min: 0 }, description: 'Height in centimeters' },
          { name: 'depth', type: 'number', validations: { required: true, min: 0 }, description: 'Depth in centimeters' },
        ],
        description: 'Product dimensions'
      },
      {
        name: 'reviews',
        type: 'array',
        children: [{
          name: 'review',
          type: 'object',
          children: [
            { name: 'userId', type: 'string', validations: { required: true }, description: 'ID of the user who left the review' },
            { name: 'rating', type: 'number', validations: { required: true, min: 1, max: 5 }, description: 'Rating from 1 to 5' },
            { name: 'comment', type: 'string', validations: { max: 500 }, description: 'Review comment (max 500 characters)' },
            { name: 'createdAt', type: 'date', validations: { required: true }, description: 'Review creation date' },
          ]
        }],
        description: 'Product reviews'
      },
    ]
  },
  orders: {
    name: 'Orders',
    type: 'object',
    children: [
      { name: 'id', type: 'string', validations: { required: true }, description: 'Unique identifier for the order' },
      { name: 'userId', type: 'string', validations: { required: true }, description: 'ID of the user who placed the order' },
      { name: 'status', type: 'enum', enumValues: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], validations: { required: true }, description: 'Current status of the order' },
      { name: 'createdAt', type: 'date', validations: { required: true }, description: 'Order creation date' },
      {
        name: 'items',
        type: 'array',
        children: [{
          name: 'item',
          type: 'object',
          children: [
            { name: 'productId', type: 'string', validations: { required: true }, description: 'ID of the ordered product' },
            { name: 'quantity', type: 'number', validations: { required: true, min: 1 }, description: 'Quantity of the product ordered' },
            { name: 'price', type: 'number', validations: { required: true, min: 0 }, description: 'Price of the product at the time of order' },
          ]
        }],
        description: 'List of items in the order'
      },
      {
        name: 'shippingAddress',
        type: 'object',
        children: [
          { name: 'street', type: 'string', validations: { required: true }, description: 'Street address' },
          { name: 'city', type: 'string', validations: { required: true }, description: 'City' },
          { name: 'state', type: 'string', validations: { required: true }, description: 'State/Province' },
          { name: 'country', type: 'string', validations: { required: true }, description: 'Country' },
          { name: 'zipCode', type: 'string', validations: { required: true }, description: 'ZIP/Postal code' },
        ],
        description: 'Shipping address for the order'
      },
      { name: 'totalAmount', type: 'calculated', calculatedField: { dependencies: ['items'], formula: '(items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)' }, description: 'Total order amount' },
      { name: 'tax', type: 'number', validations: { required: true, min: 0 }, description: 'Tax amount for the order' },
      { name: 'shippingCost', type: 'number', validations: { required: true, min: 0 }, description: 'Shipping cost for the order' },
      { name: 'grandTotal', type: 'calculated', calculatedField: { dependencies: ['totalAmount', 'tax', 'shippingCost'], formula: '(totalAmount, tax, shippingCost) => totalAmount + tax + shippingCost' }, description: 'Grand total including tax and shipping' },
    ]
  },
} satisfies Record<string, SchemaField>;

export default function ZodSchemaShowcase() {
  const [collections, setCollections] = useState(sampleCollections);
  const [activeCollection, setActiveCollection] = useState<string>('users');
  const [newSchemaName, setNewSchemaName] = useState('');
  const [isNewSchemaDialogOpen, setIsNewSchemaDialogOpen] = useState(false);

  const handleSave = (updatedSchema: SchemaField) => {
    setCollections(prev => ({
      ...prev,
      [activeCollection]: updatedSchema
    }));
  };

  const handleCollectionChange = (collectionName: string) => {
    setActiveCollection(collectionName);
  };

  const handleCreateNewSchema = () => {
    if (newSchemaName.trim() !== '') {
      const newSchema: SchemaField = {
        name: newSchemaName,
        type: 'object',
        children: []
      };
      setCollections(prev => ({
        ...prev,
        [newSchemaName]: newSchema
      }));
      setActiveCollection(newSchemaName);
      setNewSchemaName('');
      setIsNewSchemaDialogOpen(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="flex-shrink-0">
          <SidebarHeader>
            <h2 className="text-xl font-bold p-4">Zod Schema Designer Demo</h2>
          </SidebarHeader>
          <SidebarContent className="flex flex-col h-[calc(100vh-4rem)]">
            <SidebarMenu className="px-4 flex-grow">
              {Object.keys(collections).map((collectionName) => (
                <SidebarMenuItem key={collectionName}>
                  <SidebarMenuButton
                    onClick={() => handleCollectionChange(collectionName)}
                    isActive={activeCollection === collectionName}
                  >
                    {collections[collectionName as keyof typeof collections].name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <Dialog open={isNewSchemaDialogOpen} onOpenChange={setIsNewSchemaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      New Schema
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Schema</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newSchemaName}
                          onChange={(e) => setNewSchemaName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateNewSchema}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="p-4 text-sm text-gray-500 border-t">
              © {new Date().getFullYear()} Bishoy Labib. MIT License.
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-grow overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold ml-4">{collections[activeCollection as keyof typeof collections].name}</h1>
              </div>
              <a 
                href="https://github.com/Bishoymly/zod-schema-designer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
            <div className="flex-grow overflow-auto">
              <ZodSchemaDesigner
                key={activeCollection}
                initialSchema={collections[activeCollection as keyof typeof collections]}
                onSave={handleSave}
                showGeneratedCode={true}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

