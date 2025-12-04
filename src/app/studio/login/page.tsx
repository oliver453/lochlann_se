// src/app/studio/login/page.tsx
import { LoginForm } from '@/components/admin/LoginForm';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function LoginPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <LoginForm />
            </div>
  );
}