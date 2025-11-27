"use client";

import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import { FaPhone, FaClock, FaUtensils } from "react-icons/fa";
import PhoneNumbersTab from "./components/PhoneNumbersTab";
import OpeningHoursTab from "./components/OpeningHoursTab";
import LunchMenuTab from "./components/LunchMenuTab";

export default function AdminDashboard({ dict, lang }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authToken, setAuthToken] = useState("");
  const [activeTab, setActiveTab] = useState<"phones" | "hours" | "lunch">("phones");

  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken');
    if (token) {
      verifyToken(token);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/offer/list', {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        setAuthToken(token);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminAuthToken');
        setAuthToken("");
        setIsAuthenticated(false);
      }
    } catch {
      localStorage.removeItem('adminAuthToken');
      setAuthToken("");
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (password: string) => {
    try {
      const response = await fetch('/api/offer/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        localStorage.setItem('adminAuthToken', token);
        setAuthToken(token);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: "Felaktigt lösenord" };
      }
    } catch {
      return { success: false, error: "Ett fel uppstod" };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthToken');
    setIsAuthenticated(false);
    setAuthToken("");
  };

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginForm dict={dict} onLogin={handleLogin} />;
  }

  const tabs = [
    { id: "phones" as const, label: "Telefonnummer", icon: FaPhone },
    { id: "hours" as const, label: "Öppettider", icon: FaClock },
    { id: "lunch" as const, label: "Lunchmeny", icon: FaUtensils },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header med tabs */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <h1 className="text-3xl lg:text-4xl font-rustic uppercase text-white">
          Dashboard
        </h1>
        
        <button
          onClick={handleLogout}
          className="lg:self-end px-4 py-2 border border-gray-700 text-gray-400 hover:bg-gray-900 rounded transition-colors"
        >
          Logga ut
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? "bg-white text-black"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "phones" && (
          <PhoneNumbersTab authToken={authToken} dict={dict} />
        )}
        {activeTab === "hours" && (
          <OpeningHoursTab authToken={authToken} />
        )}
        {activeTab === "lunch" && (
          <LunchMenuTab authToken={authToken} lang={lang} />
        )}
      </div>
    </div>
  );
}