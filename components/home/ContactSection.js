'use client';

import Link from 'next/link';
import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import SocialCards from './SocialCards';

export default function ContactSection() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const { contactInfo } = settings;

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 text-center md:px-6">
      <AnimateIn>
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t('contactSection.heading')}
          <span className="text-gold-gradient">{t('contactSection.headingAccent')}</span>
        </h2>
        <p className="mt-3 text-sm text-neutral-500 md:text-base">
          {t('contactSection.subtitle')}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {contactInfo.phone && (
            <a href={`tel:${contactInfo.phone}`} className="btn-dark">
              📞 {contactInfo.phone}
            </a>
          )}
          {contactInfo.whatsapp && (
            <a
              href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              💬 WhatsApp
            </a>
          )}
          <Link href="/contact" className="btn-outline">
            {t('contactSection.contactPage')}
          </Link>
        </div>
      </AnimateIn>

      <SocialCards />
    </section>
  );
}
