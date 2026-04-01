'use client';

import { Loader2 } from 'lucide-react';

interface DashboardProcessingProps {
  processingProgress: number;
}

export default function DashboardProcessing({ processingProgress }: DashboardProcessingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-card p-6 rounded-full shadow-xl border-2 border-primary/5">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">Processing Meeting</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We're transcribing and analyzing your audio. This usually takes less than a minute.
      </p>

      <div className="w-full max-w-md bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${processingProgress}%` }}
        />
      </div>
      <p className="text-sm font-medium text-primary mt-3">{processingProgress}% complete</p>
    </div>
  );
}
