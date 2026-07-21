'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { useTranslation } from '@/lib/i18n/use-translation';

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useTranslation();
    const lp = useLocalePath();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="flex flex-col items-center text-center max-w-sm">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-1">{t('common.error')}</h2>
                <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
                <div className="flex items-center gap-3">
                    <Button onClick={reset}>{t('common.retry')}</Button>
                    <Button variant="outline" asChild>
                        <a href={lp('/listen')}>{t('common.back')}</a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
