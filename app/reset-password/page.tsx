import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ResetPasswordContent from './ResetPasswordContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background-2 flex items-center justify-center">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
