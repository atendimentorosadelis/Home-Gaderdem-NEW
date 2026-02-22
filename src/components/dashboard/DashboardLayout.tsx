import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { BackgroundGenerationBanner } from './BackgroundGenerationBanner';
import { useGenerationJob } from '@/hooks/use-generation-job';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Presence is now handled by OnlinePresenceProvider in App.tsx
  const {
    isGenerating,
    isComplete,
    hasFailed,
    steps,
    topic,
    articleId,
    startTime,
    cancelJob,
    clearJob,
  } = useGenerationJob();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
        
        {/* Background Generation Banner */}
        <BackgroundGenerationBanner
          isGenerating={isGenerating}
          isComplete={isComplete}
          hasFailed={hasFailed}
          steps={steps}
          topic={topic}
          articleId={articleId}
          startTime={startTime}
          onCancel={cancelJob}
          onClear={clearJob}
        />
      </div>
    </SidebarProvider>
  );
}
