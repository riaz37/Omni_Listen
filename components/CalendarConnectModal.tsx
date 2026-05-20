'use client';

import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n/use-translation';

interface CalendarConnectModalProps {
    isOpen: boolean;
    onConnect: () => void;
    onSkip: () => void;
    isConnecting?: boolean;
}

export default function CalendarConnectModal({
    isOpen,
    onConnect,
    onSkip,
    isConnecting = false,
}: CalendarConnectModalProps) {
    const { t } = useTranslation();
    return (
        <MotionDialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip(); }}>
            <DialogContent className="max-w-md overflow-hidden p-0" hideClose>
                <DialogTitle className="sr-only">{t('common_ui.calendar_connect.title')}</DialogTitle>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary px-6 py-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary-foreground">
                        {t('common_ui.calendar_connect.title')}
                    </h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className="text-muted-foreground text-center">
                        {t('common_ui.calendar_connect.body')}
                    </p>

                    <div className="space-y-3">
                        <Button
                            onClick={onConnect}
                            disabled={isConnecting}
                            loading={isConnecting}
                            iconLeft={!isConnecting ? <Calendar className="w-5 h-5" /> : undefined}
                            size="lg"
                            className="w-full rounded-xl shadow-lg hover:shadow-green-500/30"
                        >
                            {isConnecting ? t('common_ui.calendar_connect.btn_connecting') : t('common_ui.calendar_connect.btn_connect')}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={onSkip}
                            disabled={isConnecting}
                            size="lg"
                            className="w-full rounded-xl"
                        >
                            {t('common_ui.calendar_connect.btn_later')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </MotionDialog>
    );
}
