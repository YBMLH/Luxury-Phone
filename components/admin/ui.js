'use client';

// Shared building blocks for the admin. The point of these is consistency:
// every page gets its title in the same spot, its buttons in the same
// corner, and its panels in the same frame — so there is only ever one
// place to look for the thing you want.
import Link from 'next/link';
import { IconTrendUp, IconTrendDown } from './Icons';

/* --------------------------------- Layout --------------------------------- */

// Title on the left, actions on the right. Always. Every admin page starts
// with one of these, which is what stops buttons from wandering around.
export function PageHeader({ title, subtitle, count, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          {title}
          {count != null && (
            <span className="ml-2 align-middle text-base font-semibold text-neutral-400">
              {count}
            </span>
          )}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, subtitle, action, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <section className={`glass-card rounded-[20px] ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-neutral-900/5 px-5 py-3.5">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-[15px] font-semibold text-neutral-900">{title}</h2>
            )}
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* ---------------------------------- Stats --------------------------------- */

const TONES = {
  gold: 'bg-gold/10 text-gold-700',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  neutral: 'bg-neutral-100 text-neutral-600',
};

// A headline number with its own icon and, when there's a comparable
// previous period, how it moved. `delta` is a percentage; null hides it.
export function StatCard({ icon: Icon, label, value, hint, delta = null, tone = 'neutral', href }) {
  const up = delta != null && delta >= 0;
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`glass-card block rounded-[20px] p-4 ${
        href ? 'glass-card--interactive' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium leading-snug text-neutral-500">{label}</p>
        {Icon && (
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${TONES[tone]}`}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[26px] font-bold leading-tight text-neutral-900">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta != null && (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              up ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {up ? <IconTrendUp className="h-3.5 w-3.5" /> : <IconTrendDown className="h-3.5 w-3.5" />}
            {up ? '+' : ''}
            {delta}%
          </span>
        )}
        {hint && <span className="hidden truncate text-neutral-400 sm:inline">{hint}</span>}
      </div>
    </Wrapper>
  );
}

/* --------------------------------- Bits ----------------------------------- */

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// Filter tabs that carry their own counts, so you can see how much is behind
// each one before clicking it.
export function TabBar({ tabs, value, onChange }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="segmented">
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              aria-pressed={active}
              className={`segmented-item flex shrink-0 items-center gap-2 px-3.5 py-1.5 text-sm font-medium ${
                active ? '' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
              {tab.count != null && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                    active ? 'bg-neutral-900/8 text-neutral-600' : 'bg-neutral-900/6 text-neutral-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Small square-ish button used in table rows, where a full button would
// crowd the line out.
export function IconButton({ icon: Icon, label, tone = 'neutral', ...rest }) {
  const tones = {
    neutral: 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
    gold: 'border-gold/40 text-gold-700 hover:bg-gold/10',
    green: 'border-green-200 text-green-700 hover:bg-green-50',
    red: 'border-red-200 text-red-600 hover:bg-red-50',
  };
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition disabled:opacity-40 ${tones[tone]}`}
      {...rest}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function LinkButton({ icon: Icon, label, href, external = false, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
    gold: 'border-gold/40 text-gold-700 hover:bg-gold/10',
  };
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
    </Link>
  );
}
