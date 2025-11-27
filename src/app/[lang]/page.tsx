import { getDictionary } from '@/lib/dictionaries';
import { type Locale } from '../../../i18n.config';
import Header from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { WelcomeSection } from '@/components/sections/WelcomeSection';
import { InfoSections } from '@/components/sections/InfoSections';
import { HoursSection } from '@/components/sections/HoursSection';
import { FAQSection } from '@/components/sections/FAQSection';
import Footer from '@/components/layout/Footer';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { BookingButton } from '@/components/booking';
import { NewMenuModal } from '@/components/NewMenuModal';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main>
      <Header lang={lang} dict={dict} />
      <HeroSection dict={dict} />
      <WelcomeSection dict={dict} lang={lang} />
      <InfoSections dict={dict} />
      <HoursSection dict={dict} />
      <FAQSection dict={dict} />
      <Footer dict={dict} lang={lang} />
      <BookingButton dict={dict} />
      <NewMenuModal dict={dict} />
      <SocialSidebar />
    </main>
  );
}