// src/components/admin/TableMap.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Move, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  min_capacity: number;
  x_position: number;
  y_position: number;
  shape: 'rectangle' | 'circle' | 'square';
  is_active: boolean;
}

export function TableMap({ 
  initialTables,
  restaurantId 
}: { 
  initialTables: any[];
  restaurantId: string;
}) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [hasAutoPositioned, setHasAutoPositioned] = useState(false);
  const [newTableForm, setNewTableForm] = useState({
    table_number: '',
    capacity: 4,
    min_capacity: 1,
    shape: 'rectangle' as const,
  });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAutoPositioned) return;

    const tablesNeedingPosition = tables.filter(t => 
      t.x_position === null || t.x_position === 0 || 
      t.y_position === null || t.y_position === 0
    );

    if (tablesNeedingPosition.length > 0) {
      const updatedTables = tables.map((table) => {
        const needsPosition = tablesNeedingPosition.find(t => t.id === table.id);
        if (!needsPosition) return table;

        const cols = Math.ceil(Math.sqrt(tables.length));
        const tableIndex = tables.findIndex(t => t.id === table.id);
        const row = Math.floor(tableIndex / cols);
        const col = tableIndex % cols;
        
        const x = 50 + (col * 180);
        const y = 50 + (row * 140);
        
        fetch(`/api/admin/tables/${table.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x_position: x, y_position: y }),
        }).catch(err => console.error('Failed to save position:', err));
        
        return { ...table, x_position: x, y_position: y };
      });

      setTables(updatedTables);
      setHasAutoPositioned(true);
    } else {
      setHasAutoPositioned(true);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    setSelectedTable(tableId);
    setIsDragging(true);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTable || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 120));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 100));

    setTables(prev => prev.map(t => 
      t.id === selectedTable ? { ...t, x_position: x, y_position: y } : t
    ));
  };

  const handleMouseUp = async () => {
    if (!isDragging || !selectedTable) return;

    const table = tables.find(t => t.id === selectedTable);
    if (!table) {
      setIsDragging(false);
      setSelectedTable(null);
      return;
    }

    try {
      await fetch(`/api/admin/tables/${selectedTable}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          x_position: Math.round(table.x_position), 
          y_position: Math.round(table.y_position)
        }),
      });
    } catch (error) {
      console.error('Failed to update position:', error);
    }

    setIsDragging(false);
    setSelectedTable(null);
  };

  const handleDoubleClick = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setEditingTable(table);
      setShowEditDialog(true);
    }
  };

  const addTable = async () => {
    try {
      const existingCount = tables.length;
      const cols = Math.ceil(Math.sqrt(existingCount + 1));
      const row = Math.floor(existingCount / cols);
      const col = existingCount % cols;
      
      const x = 50 + (col * 180);
      const y = 50 + (row * 140);

      const response = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTableForm,
          x_position: x,
          y_position: y,
        }),
      });

      if (response.ok) {
        const newTable = await response.json();
        setTables(prev => [...prev, newTable]);
        setShowAddDialog(false);
        setNewTableForm({
          table_number: '',
          capacity: 4,
          min_capacity: 1,
          shape: 'rectangle',
        });
      }
    } catch (error) {
      console.error('Failed to add table:', error);
    }
  };

  const updateTable = async () => {
    if (!editingTable) return;

    try {
      const response = await fetch(`/api/admin/tables/${editingTable.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: editingTable.table_number,
          capacity: editingTable.capacity,
          min_capacity: editingTable.min_capacity,
          shape: editingTable.shape,
        }),
      });

      if (response.ok) {
        setTables(prev => prev.map(t => 
          t.id === editingTable.id ? editingTable : t
        ));
        setShowEditDialog(false);
        setEditingTable(null);
      }
    } catch (error) {
      console.error('Failed to update table:', error);
    }
  };

  const deleteTable = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta bord?')) return;

    try {
      const response = await fetch(`/api/admin/tables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      });

      if (response.ok) {
        setTables(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete table:', error);
    }
  };

  const activeTables = tables.filter(t => t.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{activeTables.length}</span> aktiva bord
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Lägg till bord
        </Button>
      </div>

      {/* Map Canvas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            <CardTitle>Bordskarta</CardTitle>
          </div>
          <CardDescription>
            Dubbelklicka på ett bord för att redigera. Dra och släpp för att flytta bord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef}
            className="relative bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-lg overflow-hidden select-none"
            style={{ height: '600px', minHeight: '400px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {activeTables.map((table) => (
              <div
                key={table.id}
                className={`absolute transition-shadow ${
                  selectedTable === table.id ? 'ring-2 ring-primary z-10 shadow-lg' : 'hover:shadow-md'
                }`}
                style={{
                  left: `${table.x_position || 0}px`,
                  top: `${table.y_position || 0}px`,
                  transform: isDragging && selectedTable === table.id ? 'scale(1.05)' : 'scale(1)',
                  transition: isDragging && selectedTable === table.id ? 'none' : 'transform 0.2s',
                }}
                onMouseDown={(e) => handleMouseDown(e, table.id)}
                onDoubleClick={() => handleDoubleClick(table.id)}
              >
                <TableShape 
                  table={table} 
                  onEdit={() => {
                    setEditingTable(table);
                    setShowEditDialog(true);
                  }}
                  onDelete={() => deleteTable(table.id)}
                  isSelected={selectedTable === table.id}
                />
              </div>
            ))}

            {activeTables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center max-w-sm pointer-events-auto">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Move className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Inga bord ännu</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Börja genom att lägga till ditt första bord
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Lägg till första bordet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Table Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Lägg till nytt bord</DialogTitle>
            <DialogDescription>
              Fyll i information om det nya bordet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="table_number" className="text-foreground">Bordsnummer *</Label>
              <Input
                id="table_number"
                placeholder="t.ex. 1, A1, VIP1"
                value={newTableForm.table_number}
                onChange={(e) => setNewTableForm({ ...newTableForm, table_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-foreground">Kapacitet *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={newTableForm.capacity}
                  onChange={(e) => setNewTableForm({ ...newTableForm, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_capacity" className="text-foreground">Min antal gäster</Label>
                <Input
                  id="min_capacity"
                  type="number"
                  min="1"
                  max={newTableForm.capacity}
                  value={newTableForm.min_capacity}
                  onChange={(e) => setNewTableForm({ ...newTableForm, min_capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shape" className="text-foreground">Form</Label>
              <Select value={newTableForm.shape} onValueChange={(value: any) => setNewTableForm({ ...newTableForm, shape: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Rektangel</SelectItem>
                  <SelectItem value="square">Fyrkant</SelectItem>
                  <SelectItem value="circle">Cirkel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Avbryt
            </Button>
            <Button onClick={addTable} disabled={!newTableForm.table_number}>
              Lägg till
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Redigera bord {editingTable?.table_number}</DialogTitle>
            <DialogDescription>
              Uppdatera bordinformation eller ta bort bordet
            </DialogDescription>
          </DialogHeader>

          {editingTable && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_table_number" className="text-foreground">Bordsnummer</Label>
                <Input
                  id="edit_table_number"
                  value={editingTable.table_number}
                  onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_capacity" className="text-foreground">Kapacitet</Label>
                  <Input
                    id="edit_capacity"
                    type="number"
                    min="1"
                    max="20"
                    value={editingTable.capacity}
                    onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_min_capacity" className="text-foreground">Min antal gäster</Label>
                  <Input
                    id="edit_min_capacity"
                    type="number"
                    min="1"
                    max={editingTable.capacity}
                    value={editingTable.min_capacity}
                    onChange={(e) => setEditingTable({ ...editingTable, min_capacity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_shape" className="text-foreground">Form</Label>
                <Select value={editingTable.shape} onValueChange={(value: any) => setEditingTable({ ...editingTable, shape: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">Rektangel</SelectItem>
                    <SelectItem value="square">Fyrkant</SelectItem>
                    <SelectItem value="circle">Cirkel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (editingTable) deleteTable(editingTable.id);
                setShowEditDialog(false);
              }}
              className="sm:mr-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Ta bort bord
            </Button>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Avbryt
            </Button>
            <Button onClick={updateTable}>
              Spara ändringar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TableShape({ 
  table, 
  isSelected,
}: { 
  table: Table;
  onEdit: () => void;
  onDelete: () => void;
  isSelected?: boolean;
}) {
  const shapeStyles = {
    rectangle: 'rounded-lg w-28 h-20',
    square: 'rounded-lg w-20 h-20',
    circle: 'rounded-full w-20 h-20',
  };

  return (
    <div className="relative select-none group">
      {/* Drag Handle */}
      <div className={`absolute -top-3 -left-3 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="bg-primary text-primary-foreground p-1.5 rounded-md shadow-lg pointer-events-none">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Table Shape */}
      <div className={`${shapeStyles[table.shape]} bg-background border-2 border-foreground flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-all cursor-move ${isSelected ? 'border-primary' : ''}`}>
        <div className="font-bold text-lg">{table.table_number}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {table.min_capacity === table.capacity 
            ? `${table.capacity}p` 
            : `${table.min_capacity}-${table.capacity}p`
          }
        </div>
      </div>

      {/* Hint on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Dubbelklicka för att redigera
        </div>
      </div>
    </div>
  );
}