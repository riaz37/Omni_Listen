'use client';

import { ListTodo, CalendarDays, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import { useTranslation } from '@/lib/i18n/use-translation';

interface NewTaskData {
  title: string;
  description: string;
  date: string;
  urgency: 'yes' | 'no';
}

interface AddTaskModalProps {
  show: boolean;
  newTask: NewTaskData;
  onNewTaskChange: (task: NewTaskData) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddTaskModal({ show, newTask, onNewTaskChange, onClose, onSubmit }: AddTaskModalProps) {
  const { t } = useTranslation();
  return (
    <MotionDialog open={show} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('tasks.modal_title')}</DialogTitle>
          <DialogDescription>{t('tasks.modal_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title" className="flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-muted-foreground" />
              {t('tasks.modal_title_label')}
            </Label>
            <Input
              id="task-title"
              value={newTask.title}
              onChange={(e) => onNewTaskChange({ ...newTask, title: e.target.value })}
              placeholder={t('tasks.modal_title_placeholder')}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              {t('tasks.modal_due_date_label')}
            </Label>
            <DatePicker
              value={newTask.date}
              onChange={(date) => onNewTaskChange({ ...newTask, date })}
              placeholder={t('tasks.modal_due_date_placeholder')}
            />
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
              {t('tasks.modal_urgency_label')}
            </Label>
            <CustomDropdown
              value={newTask.urgency}
              onChange={(val) => onNewTaskChange({ ...newTask, urgency: val as 'yes' | 'no' })}
              options={[
                { value: 'yes', label: t('tasks.modal_urgency_urgent') },
                { value: 'no', label: t('tasks.modal_urgency_normal') },
              ]}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-description" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {t('tasks.modal_description_label')}
            </Label>
            <Textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => onNewTaskChange({ ...newTask, description: e.target.value })}
              placeholder={t('tasks.modal_description_placeholder')}
              maxLength={500}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit}>
            {t('tasks.modal_submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </MotionDialog>
  );
}
