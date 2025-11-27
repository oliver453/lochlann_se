import 'server-only';
import { notFound } from 'next/navigation';
import type { Locale } from '../../i18n.config';
import { i18n } from '../../i18n.config';

const dictionaries = {
  sv: () => import('../../locales/sv.json').then((m) => m.default),
  en: () => import('../../locales/en.json').then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => {
  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  return dictionaries[locale]();
};
