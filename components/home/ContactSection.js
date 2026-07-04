'use client';

import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';

export default function ContactSection() {
  const { settings } = useSettings();
  const { contactInfo } = settings;

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 text-center md:px-6">
      <AnimateIn>
        <SectionHeading
          eyebrow="Get In Touch"
          title="Questions? We're Here to Help"
          subtitle="Call us, message us, or visit one of our branches in Guelma."
        />
        <div className="flex flex-wrap items-center justify-center gap-4">
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
            Contact Page →
          </Link>
        </div>
      </AnimateIn>
    </section>
  );
}
