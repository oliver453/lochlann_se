import { getDictionary } from '@/lib/dictionaries';
import { i18n } from '../../../i18n.config';
import type { Metadata } from 'next';
import AdminDashboard from './AdminDashboard';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Admin Dashboard | The Oven',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  };
}

export default async function DashboardPage() {
  // Använd svenska som default för admin
  const dict = await getDictionary('sv');

  return (
    <>
      <main className="min-h-screen bg-black">
        <div className="container mx-auto px-4 lg:px-8 xl:px-12 pt-32 pb-16">
          <AdminDashboard dict={dict} lang="sv" />
        </div>
      </main>
    </>
  );
}