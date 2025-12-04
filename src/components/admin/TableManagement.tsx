// src/components/admin/TableManagement.tsx
"use client";

import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaTable } from 'react-icons/fa';

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

export function TableManagement({ initialTables }: { initialTables: any[] }) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Table>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableForm, setNewTableForm] = useState({
    table_number: '',
    capacity: 4,
    min_capacity: 1,
    shape: 'rectangle' as const,
  });

  const addTable = async () => {
    try {
      const response = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTableForm,
          x_position: 100,
          y_position: 100,
        }),
      });

      if (response.ok) {
        const newTable = await response.json();
        setTables(prev => [...prev, newTable]);
        setShowAddForm(false);
        setNewTableForm({
          table_number: '',
          capacity: 4,
          min_capacity: 1,
          shape: 'rectangle',
        });
      }
    } catch (error) {
      console.error('Failed to add table:', error);
      alert('Kunde inte lägga till bord');
    }
  };

  const updateTable = async (id: string, updates: Partial<Table>) => {
    try {
      const response = await fetch(`/api/admin/tables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setTables(prev => prev.map(t => 
          t.id === id ? { ...t, ...updates } : t
        ));
        setEditingTable(null);
        setEditForm({});
      }
    } catch (error) {
      console.error('Failed to update table:', error);
      alert('Kunde inte uppdatera bord');
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
      alert('Kunde inte ta bort bord');
    }
  };

  const startEdit = (table: Table) => {
    setEditingTable(table.id);
    setEditForm(table);
  };

  const cancelEdit = () => {
    setEditingTable(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingTable) {
      updateTable(editingTable, editForm);
    }
  };

  const activeTables = tables.filter(t => t.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{activeTables.length}</span> aktiva bord
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <FaPlus />
          Lägg till bord
        </button>
      </div>

      {/* Add Table Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nytt bord</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bordsnummer *
              </label>
              <input
                type="text"
                value={newTableForm.table_number}
                onChange={(e) => setNewTableForm({ ...newTableForm, table_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="t.ex. 1, A1, VIP1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapacitet *
              </label>
              <input
                type="number"
                value={newTableForm.capacity}
                onChange={(e) => setNewTableForm({ ...newTableForm, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min antal gäster
              </label>
              <input
                type="number"
                value={newTableForm.min_capacity}
                onChange={(e) => setNewTableForm({ ...newTableForm, min_capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                min="1"
                max={newTableForm.capacity}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form
              </label>
              <select
                value={newTableForm.shape}
                onChange={(e) => setNewTableForm({ ...newTableForm, shape: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="rectangle">Rektangel</option>
                <option value="square">Fyrkant</option>
                <option value="circle">Cirkel</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addTable}
              disabled={!newTableForm.table_number}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Lägg till
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Tables Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTables.map((table) => (
          <div key={table.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {editingTable === table.id ? (
              // Edit Mode
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bordsnummer
                    </label>
                    <input
                      type="text"
                      value={editForm.table_number || ''}
                      onChange={(e) => setEditForm({ ...editForm, table_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapacitet
                    </label>
                    <input
                      type="number"
                      value={editForm.capacity || 0}
                      onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      min="1"
                      max="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min antal gäster
                    </label>
                    <input
                      type="number"
                      value={editForm.min_capacity || 0}
                      onChange={(e) => setEditForm({ ...editForm, min_capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      min="1"
                      max={editForm.capacity || 20}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form
                    </label>
                    <select
                      value={editForm.shape || 'rectangle'}
                      onChange={(e) => setEditForm({ ...editForm, shape: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="rectangle">Rektangel</option>
                      <option value="square">Fyrkant</option>
                      <option value="circle">Cirkel</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSave />
                      Spara
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaTable className="text-gray-600 text-xl" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          Bord {table.table_number}
                        </div>
                        <div className="text-sm text-gray-600">
                          {table.min_capacity === table.capacity ? (
                            `${table.capacity} personer`
                          ) : (
                            `${table.min_capacity}-${table.capacity} personer`
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Form:</span>
                      <span className="text-gray-900 font-medium">
                        {table.shape === 'rectangle' && 'Rektangel'}
                        {table.shape === 'square' && 'Fyrkant'}
                        {table.shape === 'circle' && 'Cirkel'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-700 font-medium">Aktivt</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => startEdit(table)}
                    className="flex-1 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-gray-300"
                  >
                    <FaEdit />
                    Redigera
                  </button>
                  <button
                    onClick={() => deleteTable(table.id)}
                    className="px-3 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                  >
                    <FaTrash />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {activeTables.length === 0 && !showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaTable className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga bord ännu</h3>
          <p className="text-gray-600 mb-6">Lägg till ditt första bord för att komma igång</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2 font-medium"
          >
            <FaPlus />
            Lägg till bord
          </button>
        </div>
      )}
    </div>
  );
}