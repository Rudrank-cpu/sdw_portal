import { useState } from 'react';
import type { ClubCode } from '@/types/api';
import { AcmLogo, AcmwLogo, GdgcLogo, IirisLogo, LfdtLogo, OwaspLogo } from './Icons';

type ClubLike = {
  code?: ClubCode | string;
  name?: string;
  logoUrl?: string;
};

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
} as const;

const officialLogosByCode: Record<string, string> = {
  ACM: '/image/acm_logo.png',
  'ACM-W': '/image/acmw_logo.png',
  GDGC: '/image/gdgc_logo.png',
  LFDT: '/image/lfdt_logo.png',
  OWASP: '/image/owasp_logo.png',
  IIRIS: '/image/iiris_logo.png',
};

const initialsFor = (club: ClubLike) => {
  const label = club.code || club.name || 'Club';
  return label
    .split(/[-\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

export function ClubLogo({ club, size = 'md' }: { club: ClubLike; size?: keyof typeof sizeClasses }) {
  const [imageFailed, setImageFailed] = useState(false);
  const code = (club.code || '').toUpperCase();
  const logoUrl = officialLogosByCode[code] ?? club.logoUrl;

  if (logoUrl && !imageFailed) {
    return (
      <img
        src={logoUrl}
        alt={`${club.name ?? club.code ?? 'Club'} logo`}
        onError={() => setImageFailed(true)}
        className={`${sizeClasses[size]} shrink-0 rounded-full border border-white/10 object-contain`}
      />
    );
  }

  if (code === 'ACM') return <AcmLogo className={`${sizeClasses[size]} shrink-0`} />;
  if (code === 'OWASP') return <OwaspLogo className={`${sizeClasses[size]} shrink-0`} />;
  if (code === 'GDGC') return <GdgcLogo className={`${sizeClasses[size]} shrink-0`} />;
  if (code === 'LFDT') return <LfdtLogo className={`${sizeClasses[size]} shrink-0`} />;
  if (code === 'ACM-W') return <AcmwLogo className={`${sizeClasses[size]} shrink-0`} />;
  if (code === 'IIRIS') return <IirisLogo className={`${sizeClasses[size]} shrink-0`} />;

  const initials = initialsFor(club);
  return (
    <span
      aria-label={`${club.name ?? club.code ?? 'Club'} logo`}
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full border border-brand-400/30 bg-brand-500/15 font-bold text-brand-300`}
    >
      {initials}
    </span>
  );
}