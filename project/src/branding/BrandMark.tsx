import { brand } from './brand';

interface BrandMarkProps {
  variant: 'emblem' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  emblem: {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  },
  full: {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-24',
    xl: 'h-32',
  },
};

export function BrandMark({ variant, size = 'md', className = '', onClick }: BrandMarkProps) {
  const src = variant === 'emblem' ? brand.logos.emblem : brand.logos.full;
  const alt = variant === 'emblem'
    ? brand.appName
    : `${brand.appName} - ${brand.slogan}`;

  const sizeClass = sizeClasses[variant][size];
  const baseClasses = 'drop-shadow-2xl object-contain object-center block';

  return (
    <img
      src={src}
      alt={alt}
      className={`${baseClasses} ${sizeClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ imageRendering: 'auto' }}
    />
  );
}
