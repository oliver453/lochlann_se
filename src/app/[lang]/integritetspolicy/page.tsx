import { getDictionary } from '@/lib/dictionaries';
import { type Locale } from '../../../../i18n.config';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { parseMarkdown } from '@/utils/markdown';
import { FaArrowRight } from 'react-icons/fa';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  return {
    title: lang === 'sv' ? 'Integritetspolicy | The Oven' : 'Privacy Policy | The Oven',
    description: lang === 'sv' 
      ? 'Läs om hur The Oven hanterar dina personuppgifter och din integritet.'
      : 'Read about how The Oven handles your personal data and privacy.',
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="bg-black text-white min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 xl:px-12 pt-32 lg:pt-40 pb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-4 font-rustic uppercase text-4xl md:text-5xl text-center">
              {dict.privacy.title}
            </h1>
            <p className="text-center text-white/60 mb-12 font-roboto">
              {dict.privacy.lastUpdated}
            </p>

            <div className="space-y-10 font-roboto">
              {/* Introduction */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.intro.title}
                </h2>
                <p className="text-white/80 leading-relaxed">
                  {dict.privacy.sections.intro.content}
                </p>
              </section>

              {/* Data Collection */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.dataCollection.title}
                </h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  {dict.privacy.sections.dataCollection.content}
                </p>
                <ul className="space-y-3 ml-6">
                  {dict.privacy.sections.dataCollection.list.map((item, index) => (
                    <li key={index} className="text-white/80 leading-relaxed list-disc">
                      <span dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
                    </li>
                  ))}
                </ul>
              </section>

              {/* Data Usage */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.dataUsage.title}
                </h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  {dict.privacy.sections.dataUsage.content}
                </p>
                <ul className="space-y-3 ml-6">
                  {dict.privacy.sections.dataUsage.list.map((item, index) => (
                    <li key={index} className="text-white/80 leading-relaxed list-disc">
                      <span dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
                    </li>
                  ))}
                </ul>
              </section>

              {/* Local Storage */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.localStorage.title}
                </h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  {dict.privacy.sections.localStorage.content}
                </p>
                <ul className="space-y-3 ml-6 mb-4">
                  {dict.privacy.sections.localStorage.list.map((item, index) => (
                    <li key={index} className="text-white/80 leading-relaxed list-disc">
                      <span dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
                    </li>
                  ))}
                </ul>
                <p className="text-white/60 italic">
                  {dict.privacy.sections.localStorage.note}
                </p>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.cookies.title}
                </h2>
                <p className="text-white/80 leading-relaxed">
                  {dict.privacy.sections.cookies.content}
                </p>
              </section>

              {/* Rights */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.rights.title}
                </h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  {dict.privacy.sections.rights.content}
                </p>
                <ul className="space-y-3 ml-6 mb-4">
                  {dict.privacy.sections.rights.list.map((item, index) => (
                    <li key={index} className="text-white/80 leading-relaxed list-disc">
                      <span dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
                    </li>
                  ))}
                </ul>
                <div className="text-white/80 leading-relaxed bg-white/5 p-4 rounded space-y-2">
                  <p>{dict.privacy.sections.rights.unsubscribe}</p>
                  <a 
                    href={`/${lang}/erbjudande/avregistrera`}
                    className="inline-flex items-center gap-2 text-white hover:underline font-semibold"
                  >
                    <FaArrowRight className="w-4 h-4" />
                    {dict.privacy.sections.rights.unsubscribeLink}
                  </a>
                </div>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.dataSharing.title}
                </h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  {dict.privacy.sections.dataSharing.content}
                </p>
                <ul className="space-y-3 ml-6">
                  {dict.privacy.sections.dataSharing.list.map((item, index) => (
                    <li key={index} className="text-white/80 leading-relaxed list-disc">
                      <span dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
                    </li>
                  ))}
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.dataSecurity.title}
                </h2>
                <p className="text-white/80 leading-relaxed">
                  {dict.privacy.sections.dataSecurity.content}
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.contact.title}
                </h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  {dict.privacy.sections.contact.content}
                </p>
                <div className="bg-white/5 p-6 rounded space-y-2">
                  <p className="text-white font-semibold">{dict.privacy.sections.contact.company}</p>
                  <p className="text-white/80">
                    <a href={`mailto:${dict.privacy.sections.contact.email}`} className="hover:underline">
                      {dict.privacy.sections.contact.email}
                    </a>
                  </p>
                  <p className="text-white/80">
                    <a href={`tel:${dict.privacy.sections.contact.phone.replace(/\s/g, '')}`} className="hover:underline">
                      {dict.privacy.sections.contact.phone}
                    </a>
                  </p>
                  <p className="text-white/80">{dict.privacy.sections.contact.address}</p>
                </div>
              </section>

              {/* Changes */}
              <section>
                <h2 className="font-rustic text-2xl uppercase mb-4">
                  {dict.privacy.sections.changes.title}
                </h2>
                <p className="text-white/80 leading-relaxed">
                  {dict.privacy.sections.changes.content}
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
      <SocialSidebar />
    </>
  );
}