import Link from "next/link";
import { FaPizzaSlice } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { cookies } from 'next/headers';
import { i18n } from '../../i18n.config';
import { getDictionary } from '@/lib/dictionaries';
import { rusticPrinted, robotoSlab } from './fonts';

export default async function RootNotFound() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('NEXT_LOCALE')?.value || i18n.defaultLocale) as 'sv' | 'en';
  
  const dict = await getDictionary(lang);

  return (
    <html 
      lang={lang}
      className={`${rusticPrinted.variable} ${robotoSlab.variable}`}
    >
      <body className={robotoSlab.className}>
        <Header lang={lang} dict={dict} />
        <main className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="text-center space-y-8 max-w-md mx-auto">
            <h1 className="text-white text-8xl md:text-9xl font-rustic tracking-tight">
              404
            </h1>
            
            <div className="space-y-4">
              <h2 className="text-white text-2xl font-light">
                {dict.notFound.title}
              </h2>
              <p className="text-gray-400 text-lg">
                {dict.notFound.description}{" "}
                <FaPizzaSlice className="inline" />
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a href={`/${lang}`}>
                <Button
                  variant="default"
                  size="lg"
                  className="bg-white hover:bg-gray-100 font-rustic uppercase text-black flex items-center justify-center w-full sm:w-auto"
                >
                  {dict.notFound.homeButton}
                </Button>
              </a>
              
              <a href={`/${lang}/meny`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white font-rustic uppercase hover:bg-white hover:text-black flex items-center justify-center w-full sm:w-auto"
                >
                  {dict.notFound.menuButton}
                </Button>
              </a>
            </div>
          </div>
        </main>
       <Footer dict={dict} lang={lang} />
      </body>
    </html>
  );
}