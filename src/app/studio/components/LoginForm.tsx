"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  dict: any;
  onLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
}

export default function LoginForm({ dict, onLogin }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const t = dict.offer.dashboard;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await onLogin(password);
    
    if (!result.success) {
      setError(result.error || t.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto flex flex-col items-center">
      <div className="mb-8">
        <Image
          src="/the-oven.svg"
          alt="The Oven"
          width={120}
          height={120}
          priority
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-900 p-8 rounded-lg w-full"
      >
        <div>
          <label
            htmlFor="password"
            className="block text-white mb-2 font-rustic uppercase text-sm"
          >
            {t.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500"
            autoComplete="current-password"
            disabled={isLoading}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-black hover:bg-gray-200 py-6 text-lg font-rustic uppercase rounded-lg disabled:opacity-50"
        >
          {t.loginButton}
        </Button>
      </form>
    </div>
  );
}
