import { getDictionary } from '@/lib/dictionaries';
import { type Locale } from '../../../../i18n.config';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { BookingButton } from '@/components/booking';
import MenuClient from './MenuClient';
import { menuMetadata, englishMenuMetadata } from '../../metadata';
import { StructuredData } from '@/components/StructuredData';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return lang === 'sv' ? menuMetadata : englishMenuMetadata;
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <StructuredData lang={lang} type="menu" />
      <main>
        <Header lang={lang} dict={dict} />
        <MenuClient dict={dict} />
        <Footer dict={dict} lang={lang} />
        <BookingButton dict={dict} />
        <SocialSidebar />
      </main>
    </>
  );
}