import { Lightbulb, Quote, AlertTriangle, CheckCircle, Sparkles, Star, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Tip/Dica Card - para dicas e sugestões
export const ArticleTipCard = ({ 
  children, 
  title = "Dica do Keven" 
}: { 
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="my-8 relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
    {/* Glow effect */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-primary/30">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <h4 className="text-lg font-semibold text-primary">{title}</h4>
      </div>
      <div className="text-foreground/90 leading-relaxed pl-13">
        {children}
      </div>
    </div>
  </div>
);

// Warning/Atenção Card - para alertas e cuidados
export const ArticleWarningCard = ({ 
  children,
  title = "Atenção!" 
}: { 
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="my-8 relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 md:p-8">
    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <h4 className="text-lg font-semibold text-amber-500">{title}</h4>
      </div>
      <div className="text-foreground/90 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

// Quote/Citação Card - para citações e destaques
export const ArticleQuoteCard = ({ 
  children,
  author 
}: { 
  children: React.ReactNode;
  author?: string;
}) => (
  <div className="my-8 relative">
    {/* Vertical accent line */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
    
    <blockquote className="pl-8 py-4">
      <Quote className="w-8 h-8 text-primary/30 mb-3" />
      <p className="text-xl md:text-2xl font-medium text-foreground/90 italic leading-relaxed">
        {children}
      </p>
      {author && (
        <footer className="mt-4 text-sm text-muted-foreground">
          — {author}
        </footer>
      )}
    </blockquote>
  </div>
);

// Highlight Box - para destacar informações importantes
export const ArticleHighlightBox = ({ 
  children,
  icon = "sparkles",
  variant = "primary"
}: { 
  children: React.ReactNode;
  icon?: "sparkles" | "star" | "heart" | "check";
  variant?: "primary" | "secondary";
}) => {
  const icons = {
    sparkles: Sparkles,
    star: Star,
    heart: Heart,
    check: CheckCircle,
  };
  const Icon = icons[icon];
  
  return (
    <div className={cn(
      "my-8 p-6 md:p-8 rounded-2xl",
      variant === "primary" 
        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20" 
        : "bg-muted/50 border border-border"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
          variant === "primary" ? "bg-primary/20" : "bg-foreground/10"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            variant === "primary" ? "text-primary" : "text-foreground"
          )} />
        </div>
        <div className="flex-1 text-foreground/90 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

// Step Card - para passos numerados especiais
export const ArticleStepCard = ({ 
  number,
  title,
  children 
}: { 
  number: number;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="my-6 flex gap-4 md:gap-6">
    {/* Number circle */}
    <div className="flex-shrink-0">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
        <span className="text-xl md:text-2xl font-bold text-primary-foreground">{number}</span>
      </div>
    </div>
    
    {/* Content */}
    <div className="flex-1 pt-1">
      <h4 className="text-lg md:text-xl font-semibold text-foreground mb-2">{title}</h4>
      <div className="text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

// Feature List Card - para lista de características/benefícios
export const ArticleFeatureList = ({ 
  items,
  title 
}: { 
  items: string[];
  title?: string;
}) => (
  <div className="my-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50">
    {title && (
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-primary" />
        {title}
      </h4>
    )}
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <ArrowRight className="w-4 h-4 text-primary mt-1.5 flex-shrink-0" />
          <span className="text-foreground/90">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Info Card - para informações gerais/curiosidades
export const ArticleInfoCard = ({ 
  children,
  title = "Você sabia?" 
}: { 
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="my-8 relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 md:p-8">
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30">
          <Sparkles className="w-5 h-5 text-blue-500" />
        </div>
        <h4 className="text-lg font-semibold text-blue-400">{title}</h4>
      </div>
      <div className="text-foreground/90 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

// Summary Card - para resumos e conclusões
export const ArticleSummaryCard = ({ 
  children,
  title = "Resumindo..." 
}: { 
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="my-10 relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-primary/10 to-background p-8 md:p-10">
    {/* Multiple glow effects */}
    <div className="absolute top-0 left-0 w-40 h-40 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
    
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/30 border border-primary/40">
          <Star className="w-6 h-6 text-primary fill-primary/30" />
        </div>
        <h4 className="text-xl font-bold text-primary">{title}</h4>
      </div>
      <div className="text-lg text-foreground leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);
