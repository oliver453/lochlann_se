"use client";

import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaEdit } from "react-icons/fa";

interface OpeningHour {
  id: number;
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
}

interface OpeningHoursTabProps {
  authToken: string;
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

export default function OpeningHoursTab({ authToken }: OpeningHoursTabProps) {
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    opensAt: "",
    closesAt: "",
    isClosed: false,
  });

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cms/opening-hours');
      if (response.ok) {
        const data = await response.json();
        setHours(data);
      }
    } catch (error) {
      console.error('Failed to load hours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (hour: OpeningHour) => {
    setEditingDay(hour.dayOfWeek);
    setFormData({
      opensAt: hour.opensAt || "",
      closesAt: hour.closesAt || "",
      isClosed: hour.isClosed,
    });
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setFormData({ opensAt: "", closesAt: "", isClosed: false });
  };

  const saveEdit = async (dayOfWeek: number) => {
    try {
      const response = await fetch('/api/admin/opening-hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          dayOfWeek,
          opensAt: formData.isClosed ? null : formData.opensAt,
          closesAt: formData.isClosed ? null : formData.closesAt,
          isClosed: formData.isClosed,
        }),
      });

      if (response.ok) {
        await loadHours();
        setEditingDay(null);
      } else {
        alert('Kunde inte spara ändringar');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Ett fel uppstod');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-white font-rustic uppercase text-sm">
                  Dag
                </th>
                <th className="px-6 py-4 text-left text-white font-rustic uppercase text-sm">
                  Öppnar
                </th>
                <th className="px-6 py-4 text-left text-white font-rustic uppercase text-sm">
                  Stänger
                </th>
                <th className="px-6 py-4 text-left text-white font-rustic uppercase text-sm">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-white font-rustic uppercase text-sm">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {hours.map((hour) => (
                <tr key={hour.dayOfWeek} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-white font-medium">
                    {WEEKDAYS[hour.dayOfWeek]}
                  </td>
                  
                  {editingDay === hour.dayOfWeek ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="time"
                          value={formData.opensAt}
                          onChange={(e) => setFormData({ ...formData, opensAt: e.target.value })}
                          disabled={formData.isClosed}
                          className="px-3 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="time"
                          value={formData.closesAt}
                          onChange={(e) => setFormData({ ...formData, closesAt: e.target.value })}
                          disabled={formData.isClosed}
                          className="px-3 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isClosed}
                            onChange={(e) => setFormData({ ...formData, isClosed: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-white text-sm">Stängt</span>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => saveEdit(hour.dayOfWeek)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            title="Spara"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            title="Avbryt"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-gray-300">
                        {hour.isClosed ? "-" : hour.opensAt || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {hour.isClosed ? "-" : hour.closesAt || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                          hour.isClosed
                            ? "bg-red-900/30 text-red-400"
                            : "bg-green-900/30 text-green-400"
                        }`}>
                          {hour.isClosed ? "Stängt" : "Öppet"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => startEdit(hour)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                          title="Redigera"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          💡 Tips: Ändringarna syns direkt på hemsidan när du sparar.
        </p>
      </div>
    </div>
  );
}