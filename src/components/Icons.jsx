const I = ({ size = 16, sw = 1.5, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}
  >
    {children}
  </svg>
);

export const ShieldCheck = ({ size = 16 }) => (
  <I size={size} sw={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </I>
);

export const Wallet = ({ size = 16 }) => (
  <I size={size} sw={2}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </I>
);

export const ArrowUpRight = ({ size = 16 }) => (
  <I size={size} sw={2}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </I>
);

export const DollarSign = ({ size = 16 }) => (
  <I size={size}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 18V6" />
  </I>
);

export const MapPin = ({ size = 16 }) => (
  <I size={size}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </I>
);

export const Receipt = ({ size = 16 }) => (
  <I size={size}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17.5v-11" />
  </I>
);

export const Send = ({ size = 16 }) => (
  <I size={size} sw={2}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </I>
);

export const AlertTriangle = ({ size = 16 }) => (
  <I size={size}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </I>
);

export const ArrowLeft = ({ size = 14 }) => (
  <I size={size} sw={2}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </I>
);

export const Check = ({ size = 24 }) => (
  <I size={size} sw={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </I>
);

export const ExternalLink = ({ size = 12 }) => (
  <I size={size} sw={2}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </I>
);

export const RefreshCw = ({ size = 14 }) => (
  <I size={size} sw={2}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </I>
);

export const Lock = ({ size = 16 }) => (
  <I size={size}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </I>
);

export const Zap = ({ size = 16 }) => (
  <I size={size}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </I>
);

export const Eye = ({ size = 16 }) => (
  <I size={size}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </I>
);

export const Activity = ({ size = 11 }) => (
  <I size={size} sw={2.5}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </I>
);

export const Info = ({ size = 12 }) => (
  <I size={size} sw={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </I>
);

export const CircleCheck = ({ size = 13 }) => (
  <I size={size} sw={2}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </I>
);

export const Coins = ({ size = 13 }) => (
  <I size={size}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
  </I>
);

export const Copy = ({ size = 14 }) => (
  <I size={size} sw={2}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </I>
);

export const TrendUp = ({ size = 13 }) => (
  <I size={size} sw={2}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </I>
);
