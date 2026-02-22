import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({ value, duration = 800, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Skip animation if value is 0 or hasn't changed
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    // Initial animation on first mount when visible
    if (!hasAnimatedRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            animateValue(0, value);
          }
        },
        { threshold: 0.1 }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }

    // Animate from previous to new value on updates
    if (value !== prevValueRef.current) {
      animateValue(prevValueRef.current, value);
    }
  }, [value, duration]);

  const animateValue = (from: number, to: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      const currentValue = Math.floor(from + (to - from) * easedProgress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
        prevValueRef.current = to;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  );
}
