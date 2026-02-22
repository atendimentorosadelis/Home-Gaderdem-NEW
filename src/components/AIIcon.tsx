import { forwardRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import aiIconLight from '@/assets/ai-icon-light.png';
import aiIconDark from '@/assets/ai-icon-dark.png';

interface AIIconProps extends React.HTMLAttributes<HTMLImageElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const AIIcon = forwardRef<HTMLImageElement, AIIconProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Use resolvedTheme for system theme detection
    const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';
    const iconSrc = currentTheme === 'light' ? aiIconLight : aiIconDark;

    if (!mounted) {
      // Return a placeholder with the same dimensions to prevent layout shift
      return <span className={cn(sizeClasses[size], className)} />;
    }

    return (
      <img 
        ref={ref}
        src={iconSrc} 
        alt="IA" 
        className={cn(sizeClasses[size], 'object-contain', className)}
        {...props}
      />
    );
  }
);

AIIcon.displayName = 'AIIcon';
