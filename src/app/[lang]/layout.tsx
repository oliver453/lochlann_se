import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { i18n, type Locale } from '../../../i18n.config';
import { defaultMetadata, englishMetadata } from '../metadata';
import { StructuredData } from '@/components/StructuredData';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return lang === 'sv' ? defaultMetadata : englishMetadata;
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!i18n.locales.includes(lang as Locale)) {
    notFound();
  }

  return (
    <>
      <StructuredData lang={lang as Locale} type="home" />
      {children}
    </>
  );
}