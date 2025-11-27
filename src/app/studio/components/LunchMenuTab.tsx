"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaLeaf, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Helper function to get current week number (ISO week)
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getCurrentWeekAndYear(): { week: number; year: number } {
  const now = new Date();
  return {
    week: getWeekNumber(now),
    year: now.getFullYear(),
  };
}

interface LunchItem {
  id: number;
  weekNumber: number;
  year: number;
  dayOfWeek: number;
  dishNameSv: string;
  dishNameEn: string;
  descriptionSv: string | null;
  descriptionEn: string | null;
  price: number;
  isVegetarian: boolean;
  isAvailable: boolean;
}

interface LunchMenuTabProps {
  authToken: string;
  lang: string;
}

const WEEKDAYS = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
];

export default function LunchMenuTab({ authToken, lang }: LunchMenuTabProps) {
  const [items, setItems] = useState<LunchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    weekNumber: 0,
    year: 0,
    dayOfWeek: 0,
    dishNameSv: "",
    dishNameEn: "",
    descriptionSv: "",
    descriptionEn: "",
    price: 0,
    isVegetarian: false,
  });

  useEffect(() => {
    const { week, year } = getCurrentWeekAndYear();
    setCurrentWeek(week);
    setCurrentYear(year);
    setFormData(prev => ({ ...prev, weekNumber: week, year }));
    loadMenu(week, year);
  }, []);

  const loadMenu = async (week: number, year: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cms/lunch?week=${week}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      weekNumber: currentWeek,
      year: currentYear,
      dayOfWeek: 0,
      dishNameSv: "",
      dishNameEn: "",
      descriptionSv: "",
      descriptionEn: "",
      price: 0,
      isVegetarian: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (item: LunchItem) => {
    setFormData({
      id: item.id,
      weekNumber: item.weekNumber,
      year: item.year,
      dayOfWeek: item.dayOfWeek,
      dishNameSv: item.dishNameSv,
      dishNameEn: item.dishNameEn,
      descriptionSv: item.descriptionSv || "",
      descriptionEn: item.descriptionEn || "",
      price: item.price,
      isVegetarian: item.isVegetarian,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dishNameSv || !formData.dishNameEn || formData.price <= 0) {
      alert('Fyll i alla obligatoriska fält');
      return;
    }

    try {
      const response = await fetch('/api/admin/lunch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadMenu(formData.weekNumber, formData.year);
        resetForm();
      } else {
        alert('Kunde inte spara rätten');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Ett fel uppstod');
    }
  };

  const handleDelete = async (item: LunchItem) => {
    if (!confirm(`Vill du verkligen ta bort ${item.dishNameSv}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/lunch?id=${item.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        await loadMenu(currentWeek, currentYear);
      } else {
        alert('Kunde inte ta bort rätten');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ett fel uppstod');
    }
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    let newWeek = currentWeek;
    let newYear = currentYear;

    if (direction === 'next') {
      newWeek++;
      if (newWeek > 52) {
        newWeek = 1;
        newYear++;
      }
    } else {
      newWeek--;
      if (newWeek < 1) {
        newWeek = 52;
        newYear--;
      }
    }

    setCurrentWeek(newWeek);
    setCurrentYear(newYear);
    loadMenu(newWeek, newYear);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
  <button
    onClick={() => changeWeek('prev')}
    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
  >
    <FaChevronLeft /> Föregående vecka
  </button>
  
  <div className="text-center">
    <p className="text-white font-rustic text-xl">
      Vecka {currentWeek}, {currentYear}
    </p>
    <p className="text-gray-400 text-sm mt-1">
      {items.length} {items.length === 1 ? 'rätt' : 'rätter'}
    </p>
  </div>

  <button
    onClick={() => changeWeek('next')}
    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
  >
    Nästa vecka <FaChevronRight />
  </button>
</div>


      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          <FaPlus />
          Lägg till lunchrätt
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-rustic uppercase text-white mb-6">
            {editingId ? "Redigera rätt" : "Ny lunchrätt"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2 text-sm">Veckodag *</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500"
                required
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={index} value={index}>{day}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 text-sm">Rättnamn (Svenska) *</label>
                <input
                  type="text"
                  value={formData.dishNameSv}
                  onChange={(e) => setFormData({ ...formData, dishNameSv: e.target.value })}
                  className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 text-sm">Dish name (English) *</label>
                <input
                  type="text"
                  value={formData.dishNameEn}
                  onChange={(e) => setFormData({ ...formData, dishNameEn: e.target.value })}
                  className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 text-sm">Beskrivning (Svenska)</label>
                <textarea
                  value={formData.descriptionSv}
                  onChange={(e) => setFormData({ ...formData, descriptionSv: e.target.value })}
                  className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-white mb-2 text-sm">Description (English)</label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 text-sm">Pris (kr) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500"
                  min="0"
                  required
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer px-4 py-3">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-white">Vegetarisk</span>
                  <FaLeaf className="text-green-400" />
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded font-medium transition-colors"
              >
                {editingId ? "Uppdatera" : "Lägg till"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu list - Card-baserad för mobil */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-900 rounded-lg">
          Ingen lunchmeny för denna vecka ännu
        </div>
      ) : (
        <div className="space-y-4">
          {/* Gruppera per dag */}
          {Object.entries(
            items.reduce((acc, item) => {
              if (!acc[item.dayOfWeek]) acc[item.dayOfWeek] = [];
              acc[item.dayOfWeek].push(item);
              return acc;
            }, {} as Record<number, LunchItem[]>)
          )
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, dayItems]) => (
              <div key={day} className="bg-gray-900 rounded-lg overflow-hidden">
                {/* Day header */}
                <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                  <h3 className="font-rustic text-lg uppercase text-white">
                    {WEEKDAYS[parseInt(day)]}
                  </h3>
                </div>

                {/* Dishes for this day */}
                <div className="divide-y divide-gray-800">
                  {dayItems.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        {/* Dish info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-medium truncate">
                              {lang === 'sv' ? item.dishNameSv : item.dishNameEn}
                            </h4>
                            {item.isVegetarian && (
                              <FaLeaf className="text-green-400 w-3 h-3 flex-shrink-0" />
                            )}
                          </div>
                          
                          {(item.descriptionSv || item.descriptionEn) && (
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                              {lang === 'sv' ? item.descriptionSv : item.descriptionEn}
                            </p>
                          )}

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-white font-bold">
                              {item.price} kr
                            </span>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              item.isAvailable
                                ? "bg-green-900/30 text-green-400"
                                : "bg-gray-700 text-gray-400"
                            }`}>
                              {item.isAvailable ? "Tillgänglig" : "Ej tillgänglig"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 sm:flex-col sm:items-end">
                          <button
                            onClick={() => startEdit(item)}
                            className="flex-1 sm:flex-none p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            title="Redigera"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="flex-1 sm:flex-none p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                            title="Ta bort"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          💡 Tips: Lägg till lunchen för kommande veckor i förväg så slipper du stressa!
        </p>
      </div>
    </div>
  );
}