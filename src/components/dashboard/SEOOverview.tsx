import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Search, FileText, Image, AlignLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SEOOverviewProps {
  overallScore: number;
  criteriaPercentages: {
    keywords: number;
    excerpt: number;
    coverImage: number;
    content: number;
  };
  isLoading?: boolean;
}

// Hook for animated count-up
function useCountUp(target: number, duration: number = 1500, enabled: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(target * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, enabled]);

  return count;
}

export function SEOOverview({ overallScore, criteriaPercentages, isLoading }: SEOOverviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Trigger animations after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animated values
  const animatedScore = useCountUp(overallScore, 1500, isVisible && !isLoading);
  const animatedKeywords = useCountUp(criteriaPercentages.keywords, 1200, isVisible && !isLoading);
  const animatedExcerpt = useCountUp(criteriaPercentages.excerpt, 1200, isVisible && !isLoading);
  const animatedCoverImage = useCountUp(criteriaPercentages.coverImage, 1200, isVisible && !isLoading);
  const animatedContent = useCountUp(criteriaPercentages.content, 1200, isVisible && !isLoading);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-destructive';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-primary';
    if (value >= 60) return 'bg-amber-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-destructive';
  };

  const criteria = [
    { label: 'Keywords', value: criteriaPercentages.keywords, animatedValue: animatedKeywords, icon: Search, delay: 0 },
    { label: 'Excerpt', value: criteriaPercentages.excerpt, animatedValue: animatedExcerpt, icon: FileText, delay: 100 },
    { label: 'Imagem', value: criteriaPercentages.coverImage, animatedValue: animatedCoverImage, icon: Image, delay: 200 },
    { label: 'Conteúdo', value: criteriaPercentages.content, animatedValue: animatedContent, icon: AlignLeft, delay: 300 },
  ];

  // Calculate circumference for SVG circle
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isVisible 
    ? circumference - (overallScore / 100) * circumference 
    : circumference;

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Score SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] sm:h-[280px] p-3 sm:p-6">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Score SEO
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Gauge Circle with Animation */}
          <div className={cn(
            "relative w-28 h-28 sm:w-44 sm:h-44 flex-shrink-0 transition-all duration-700",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              {/* Progress circle with animation */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-[1500ms] ease-out"
                style={{
                  filter: isVisible ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' : 'none'
                }}
              />
            </svg>
            {/* Pulse ring effect */}
            <div className={cn(
              "absolute inset-0 rounded-full border-2 sm:border-4 border-primary/20",
              isVisible && overallScore >= 80 && "animate-pulse"
            )} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-2xl sm:text-4xl font-bold transition-all duration-300",
                getScoreColor(overallScore)
              )}>
                {animatedScore}%
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">Score Geral</span>
            </div>
          </div>

          {/* Criteria Bars with Staggered Animation */}
          <div className="flex-1 w-full space-y-3 sm:space-y-4">
            {criteria.map((item, index) => (
              <div 
                key={item.label} 
                className={cn(
                  "space-y-1 sm:space-y-1.5 transition-all duration-500",
                  isVisible 
                    ? "opacity-100 translate-x-0" 
                    : "opacity-0 translate-x-4"
                )}
                style={{ 
                  transitionDelay: isVisible ? `${item.delay}ms` : '0ms' 
                }}
              >
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <item.icon className={cn(
                      "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors duration-300",
                      isVisible ? "text-muted-foreground" : "text-transparent"
                    )} />
                    <span>{item.label}</span>
                  </div>
                  <span className={cn(
                    "font-medium tabular-nums transition-all duration-300",
                    getScoreColor(item.value)
                  )}>
                    {item.animatedValue}%
                  </span>
                </div>
                <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-[1200ms] ease-out",
                      getProgressColor(item.value)
                    )}
                    style={{ 
                      width: isVisible ? `${item.value}%` : '0%',
                      transitionDelay: `${item.delay + 200}ms`,
                      boxShadow: isVisible && item.value >= 80 
                        ? '0 0 8px hsl(var(--primary) / 0.5)' 
                        : 'none'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
