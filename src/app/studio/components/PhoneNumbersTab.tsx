"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FaDownload, FaQrcode, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ScannerModal from "./ScannerModal";

interface OfferEntry {
  phoneNumber: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
}

interface Stats {
  total: number;
  active: number;
  used: number;
  expired: number;
}

interface PhoneNumbersTabProps {
  authToken: string;
  dict: any;
}

const ITEMS_PER_PAGE = 50;

export default function PhoneNumbersTab({ authToken, dict }: PhoneNumbersTabProps) {
  const [entries, setEntries] = useState<OfferEntry[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, used: 0, expired: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "used" | "expired">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showScanner, setShowScanner] = useState(false);

  const t = dict?.offer?.dashboard || {};

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/offer/list', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        setStats({
          total: data.total,
          active: data.active,
          used: data.used,
          expired: data.expired
        });
      }
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await fetch('/api/offer/export', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telefonnummer-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getStatusBadge = (entry: OfferEntry) => {
    if (entry.used) {
      return <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">Använd</span>;
    }
    if (new Date(entry.expiresAt) <= new Date()) {
      return <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">Utgången</span>;
    }
    return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">Giltig</span>;
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (filterStatus !== "all") {
      filtered = filtered.filter(entry => {
        const now = new Date();
        const isExpired = new Date(entry.expiresAt) <= now;
        
        if (filterStatus === "active") return !entry.used && !isExpired;
        if (filterStatus === "used") return entry.used;
        if (filterStatus === "expired") return !entry.used && isExpired;
        return true;
      });
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.phoneNumber.includes(search) || 
        entry.code.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [entries, filterStatus, searchTerm]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntries, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-200"
        >
          <FaQrcode />
          Skanna kod
        </Button>
        <Button
          onClick={downloadCSV}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FaDownload />
          {t.downloadCSV || "Ladda ner CSV"}
        </Button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setFilterStatus("all")}
          className={`bg-gray-900 rounded-lg p-4 lg:p-6 text-left transition-all ${
            filterStatus === "all" ? "ring-2 ring-white" : "hover:bg-gray-800"
          }`}
        >
          <p className="text-gray-400 text-xs lg:text-sm mb-1 font-rustic uppercase">{t.total || "Totalt"}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">{stats.total}</p>
        </button>
        
        <button
          onClick={() => setFilterStatus("active")}
          className={`bg-gray-900 rounded-lg p-4 lg:p-6 text-left transition-all ${
            filterStatus === "active" ? "ring-2 ring-green-500" : "hover:bg-gray-800"
          }`}
        >
          <p className="text-gray-400 text-xs lg:text-sm mb-1 font-rustic uppercase">Giltiga</p>
          <p className="text-2xl lg:text-3xl font-bold text-green-400">{stats.active}</p>
        </button>
        
        <button
          onClick={() => setFilterStatus("used")}
          className={`bg-gray-900 rounded-lg p-4 lg:p-6 text-left transition-all ${
            filterStatus === "used" ? "ring-2 ring-blue-500" : "hover:bg-gray-800"
          }`}
        >
          <p className="text-gray-400 text-xs lg:text-sm mb-1 font-rustic uppercase">Använda</p>
          <p className="text-2xl lg:text-3xl font-bold text-blue-400">{stats.used}</p>
        </button>
        
        <button
          onClick={() => setFilterStatus("expired")}
          className={`bg-gray-900 rounded-lg p-4 lg:p-6 text-left transition-all ${
            filterStatus === "expired" ? "ring-2 ring-red-500" : "hover:bg-gray-800"
          }`}
        >
          <p className="text-gray-400 text-xs lg:text-sm mb-1 font-rustic uppercase">Utgångna</p>
          <p className="text-2xl lg:text-3xl font-bold text-red-400">{stats.expired}</p>
        </button>
      </div>

      {/* Sökfält */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Sök telefonnummer eller kod..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 font-mono"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center text-gray-400 py-12 bg-gray-900 rounded-lg">
          {searchTerm || filterStatus !== "all" ? "Inga resultat hittades" : t.noNumbers || "Inga nummer ännu"}
        </div>
      ) : (
        <>
          <div className="text-gray-400 text-sm mb-4">
            Visar {paginatedEntries.length} av {filteredEntries.length} {filteredEntries.length !== stats.total && `(totalt ${stats.total})`}
          </div>

          {/* Tabell */}
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300 font-rustic uppercase text-sm">
                      {t.mobileNumber || "Mobilnummer"}
                    </th>
                    <th className="px-4 py-3 text-left text-gray-300 font-rustic uppercase text-sm">
                      {t.code || "Kod"}
                    </th>
                    <th className="px-4 py-3 text-left text-gray-300 font-rustic uppercase text-sm">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-gray-300 font-rustic uppercase text-sm">
                      Skapad
                    </th>
                    <th className="px-4 py-3 text-left text-gray-300 font-rustic uppercase text-sm">
                      Giltig till
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedEntries.map((entry, index) => (
                    <tr key={`${entry.code}-${index}`} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-white font-mono text-sm">
                        {entry.phoneNumber}
                      </td>
                      <td className="px-4 py-3 text-white font-mono text-base font-bold">
                        {entry.code}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(entry)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(entry.createdAt).toLocaleString('sv-SE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(entry.expiresAt).toLocaleDateString('sv-SE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginering */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FaChevronLeft /> Föregående
              </Button>
              
              <span className="text-white font-mono">
                Sida {currentPage} av {totalPages}
              </span>
              
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="flex items-center gap-2"
              >
                Nästa <FaChevronRight />
              </Button>
            </div>
          )}
        </>
      )}

      {showScanner && (
        <ScannerModal
          authToken={authToken}
          onClose={() => setShowScanner(false)}
          onCodeUsed={loadEntries}
        />
      )}
    </div>
  );
}