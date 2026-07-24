'use client';

import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import Locations from '@/components/home/Locations';
import AnimateIn from '@/components/AnimateIn';

export default function ContactPage() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const { contactInfo, socialLinks } = settings;

  const cards = [
    contactInfo.phone && {
      icon: '📞',
      title: t('contactPage.callUs'),
      value: contactInfo.phone,
      href: `tel:${contactInfo.phone}`,
    },
    contactInfo.whatsapp && {
      icon: '💬',
      title: t('contactPage.whatsapp'),
      value: contactInfo.whatsapp,
      href: `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`,
    },
    contactInfo.email && {
      icon: '✉️',
      title: t('contactPage.email'),
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    contactInfo.workingHours && {
      icon: '🕐',
      title: t('contactPage.workingHours'),
      value: contactInfo.workingHours,
    },
  ].filter(Boolean);

  return (
    <>
      <section className="border-b border-neutral-200 bg-white py-16 text-center">
        <AnimateIn className="mx-auto max-w-2xl px-4">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
            {t('contactPage.heading')}<span className="text-gold-gradient">{t('contactPage.headingAccent')}</span>
          </h1>
          <p className="mt-5 text-neutral-500">
            {t('contactPage.subtitle')}
          </p>
        </AnimateIn>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        {cards.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">
            {t('contactPage.noContact')}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {cards.map((card, i) => (
              <AnimateIn key={card.title} delay={i * 0.07}>
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-gold/60 hover:shadow-card-hover"
                  >
                    <span className="text-3xl">{card.icon}</span>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-neutral-400">
                        {card.title}
                      </p>
                      <p className="font-semibold text-neutral-800">{card.value}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm">
                    <span className="text-3xl">{card.icon}</span>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-neutral-400">
                        {card.title}
                      </p>
                      <p className="font-semibold text-neutral-800">{card.value}</p>
                    </div>
                  </div>
                )}
              </AnimateIn>
            ))}
          </div>
        )}

        {(socialLinks.facebook || socialLinks.instagram || socialLinks.tiktok) && (
          <div className="mt-10 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500">
              {t('contactPage.followUs')}
            </p>
            <div className="flex justify-center gap-3">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="btn-outline !px-5 !py-2">
                  Facebook
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="btn-outline !px-5 !py-2">
                  Instagram
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="btn-outline !px-5 !py-2">
                  TikTok
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      <Locations />
    </>
  );
}
