export default function SectionHeading({ eyebrow, title, subtitle, dark = false }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-3xl font-bold md:text-4xl ${
          dark ? 'text-white' : 'text-neutral-900'
        }`}
      >
        {title}
      </h2>
      <div className="gold-line mx-auto mt-4" />
      {subtitle && (
        <p className={`mt-4 text-sm md:text-base ${dark ? 'text-neutral-300' : 'text-neutral-600'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
