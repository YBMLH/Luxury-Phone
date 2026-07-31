// One stroke-based icon set for the whole admin. Emoji were fine as
// placeholders but they render differently on every device and can't take a
// colour, so navigation and buttons use these instead.
//
// Every icon is a 24x24 viewBox drawn with currentColor, so size and colour
// come from the parent's font-size and text colour.

function Svg({ children, className = 'h-5 w-5', strokeWidth = 1.7, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconDashboard = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Svg>
);

export const IconBox = (p) => (
  <Svg {...p}>
    <path d="M21 8.5 12 13 3 8.5 12 4l9 4.5Z" />
    <path d="M3 8.5v7L12 20l9-4.5v-7" />
    <path d="M12 13v7" />
  </Svg>
);

export const IconReceipt = (p) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6M9 12h6" />
  </Svg>
);

export const IconUsers = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-2.2-4.4" />
  </Svg>
);

export const IconHistory = (p) => (
  <Svg {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4.5l3 1.8" />
  </Svg>
);

export const IconSettings = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </Svg>
);

export const IconBell = (p) => (
  <Svg {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 13 18 8Z" />
    <path d="M13.7 18.5a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconStore = (p) => (
  <Svg {...p}>
    <path d="M4 9h16v11H4V9Z" />
    <path d="M3 9l1.6-5h14.8L21 9" />
    <path d="M10 20v-6h4v6" />
  </Svg>
);

export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5M5 12h11" />
  </Svg>
);

export const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M12 3v12" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M4 20h16" />
  </Svg>
);

export const IconAlert = (p) => (
  <Svg {...p}>
    <path d="M10.3 3.8 2.5 17.4A2 2 0 0 0 4.2 20.4h15.6a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4.5M12 17h.01" />
  </Svg>
);

export const IconTrendUp = (p) => (
  <Svg {...p}>
    <path d="m3 16 6-6 4 4 8-8" />
    <path d="M15 6h6v6" />
  </Svg>
);

export const IconTrendDown = (p) => (
  <Svg {...p}>
    <path d="m3 8 6 6 4-4 8 8" />
    <path d="M15 18h6v-6" />
  </Svg>
);

export const IconCash = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 10v4M18 10v4" />
  </Svg>
);

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5.2l3.2 1.9" />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const IconPhone = (p) => (
  <Svg {...p}>
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4l1.5-1Z" />
  </Svg>
);

export const IconWhatsApp = (p) => (
  <Svg {...p}>
    <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.5a8.4 8.4 0 1 1 15.4-4.4Z" />
    <path d="M9 9.2c0 3 2.3 5.3 5.2 5.4.6 0 1.1-.4 1.2-1l.1-.6-2-.9-.8.9a4.6 4.6 0 0 1-2-2l.9-.8-.9-2-.6.1c-.6.1-1.1.6-1.1 1.2Z" />
  </Svg>
);

export const IconEye = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconTrash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.8 13h9.4l.8-13" />
  </Svg>
);

export const IconEdit = (p) => (
  <Svg {...p}>
    <path d="M4 20h4l10-10-4-4L4 16v4Z" />
    <path d="m14.5 5.5 4 4" />
  </Svg>
);

export const IconCopy = (p) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
    <path d="M15.5 5.5H5.5a2 2 0 0 0-2 2v10" />
  </Svg>
);

export const IconVolumeOn = (p) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
    <path d="M15.5 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10" />
  </Svg>
);

export const IconVolumeOff = (p) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
    <path d="m16 10 4 4M20 10l-4 4" />
  </Svg>
);

export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconClose = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconPrinter = (p) => (
  <Svg {...p}>
    <path d="M7 9V3.5h10V9" />
    <rect x="3.5" y="9" width="17" height="7" rx="2" />
    <path d="M7 14h10v6.5H7V14Z" />
  </Svg>
);

export const IconTruck = (p) => (
  <Svg {...p}>
    <path d="M2.5 6.5h10v9h-10v-9Z" />
    <path d="M12.5 10h4l3 3v2.5h-7V10Z" />
    <circle cx="6.5" cy="18" r="1.8" />
    <circle cx="16.5" cy="18" r="1.8" />
  </Svg>
);

export const IconStar = (p) => (
  <Svg {...p}>
    <path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8L12 3.8Z" />
  </Svg>
);

export const IconUpload = (p) => (
  <Svg {...p}>
    <path d="M12 16V4" />
    <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
    <path d="M4 20h16" />
  </Svg>
);

export const IconBan = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m6 6 12 12" />
  </Svg>
);
