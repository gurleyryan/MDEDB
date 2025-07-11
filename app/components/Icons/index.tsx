import {
  ClockIcon, CheckCircleIcon, XCircleIcon, PencilSimpleIcon, ChartBarIcon, FloppyDiskIcon, XIcon,
  GlobeIcon, LightningIcon, CloudIcon, MapPinIcon, TrendUpIcon, CalendarIcon,
  SortAscendingIcon, SortDescendingIcon,FunnelIcon, MagnifyingGlassIcon, PlusIcon, SignOutIcon, HashIcon, ListChecksIcon, ChatCircleIcon, LightbulbIcon,
  EnvelopeIcon, UsersIcon, TrophyIcon, MegaphoneIcon,
} from '@phosphor-icons/react';

export const ClimateIcons = {
  // Action Icons (Phosphor)
  edit: <PencilSimpleIcon className="w-4 h-4" weight="duotone" />,
  scoring: <ChartBarIcon className="w-4 h-4" weight="duotone" />,
  pending: <ClockIcon className="w-4 h-4" weight="duotone" />,
  approved: <CheckCircleIcon className="w-4 h-4" weight="duotone" />,
  rejected: <XCircleIcon className="w-4 h-4" weight="duotone" />,
  save: <FloppyDiskIcon className="w-4 h-4" weight="duotone" />,
  cancel: <XIcon className="w-4 h-4" weight="duotone" />,
  plus: <PlusIcon className="w-4 h-4" weight="duotone" />,
  search: <MagnifyingGlassIcon className="w-4 h-4" weight="duotone" />,
  logout: <SignOutIcon className="w-4 h-4" weight="duotone" />,
  total: <HashIcon className="w-4 h-4" weight="duotone" />,
  guide: <ListChecksIcon className="w-4 h-4" weight="duotone" />,
  comments: <ChatCircleIcon className="w-4 h-4" weight="duotone" />,
  tip: <LightbulbIcon className="w-4 h-4" weight="duotone" />,
  website: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  email: <EnvelopeIcon className="w-4 h-4" weight="duotone" />,
  calendar: <CalendarIcon className="w-4 h-4" weight="duotone" />,
  trophy: <TrophyIcon className="w-4 h-4" weight="duotone" />,
  announcement: <MegaphoneIcon className="w-4 h-4" weight="duotone" />,
  capacity: <UsersIcon className="w-4 h-4" weight="duotone" />,

  // Sort/Filter Icons (Phosphor)
  name: <SortAscendingIcon className="w-4 h-4" weight="duotone" />,
  status: <FunnelIcon className="w-4 h-4" weight="duotone" />,
  country: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  recent: <CalendarIcon className="w-4 h-4" weight="duotone" />,
  sortAsc: <SortAscendingIcon className="w-4 h-4" weight="duotone" />,
  sortDesc: <SortDescendingIcon className="w-4 h-4" weight="duotone" />,

  // Climate/Environment Icons (Phosphor)
  mission: <MapPinIcon className="w-4 h-4" weight="duotone" />,
  energy: <LightningIcon className="w-4 h-4" weight="duotone" />,
  climate: <CloudIcon className="w-4 h-4" weight="duotone" />,

  // Score Range Icons (Phosphor)
  strong: <TrendUpIcon className="w-4 h-4" weight="duotone" />,
  promising: <ChartBarIcon className="w-4 h-4" weight="duotone" />,
  low: <ChartBarIcon className="w-4 h-4" weight="duotone" />,
  unscored: <ChartBarIcon className="w-4 h-4" weight="duotone" />,

  // Add more country icons as needed...
  mexico: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  brazil: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  argentina: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  chile: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  colombia: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  unitedKingdom: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  germany: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  france: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  italy: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  spain: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  netherlands: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  nigeria: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  kenya: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  southAfrica: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  ghana: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  india: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  china: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  japan: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  southKorea: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  thailand: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  australia: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  newZealand: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  uae: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  saudiArabia: <GlobeIcon className="w-4 h-4" weight="duotone" />,
  israel: <GlobeIcon className="w-4 h-4" weight="duotone" />,

  // Status Icons (Custom SVG)

  scrollToTop: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ),

  // Regional Icons (Custom SVG for uniqueness)
  northAmerica: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 12h18M12 3v18M8 8h8v8H8z" />
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),

  southAmerica: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2L8 8h8l-4-6zM8 16l4 6 4-6H8z" />
      <path d="M6 10h12v4H6z" />
    </svg>
  ),

  europe: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 12h18M9 5v14M15 5v14" />
    </svg>
  ),

  africa: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),

  asia: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
      <polygon points="12,7 18,10 18,14 12,17 6,14 6,10" />
    </svg>
  ),

  oceania: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="10" r="1.5" />
      <circle cx="10" cy="16" r="1" />
    </svg>
  ),

  middleEast: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2L6 8v8l6 6 6-6V8l-6-6z" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),

  // Scoring Options (Custom for clarity)
  yes: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),

  no: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),

  unclear: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),

  // Country Flags (Simplified geometric representations)
  unitedStates: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 9h7M3 13h7M10 5v8" />
      <path d="M13 7h8M13 11h8M13 15h8" />
    </svg>
  ),

  canada: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M12 8l2 4h-4l2-4zM10 12l4 4 4-4" />
    </svg>
  ),
};