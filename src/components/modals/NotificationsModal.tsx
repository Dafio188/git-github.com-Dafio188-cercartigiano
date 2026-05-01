import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { NotificationsView } from '../NotificationsView';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none">
        <VisuallyHidden>
          <DialogTitle>Notifiche</DialogTitle>
        </VisuallyHidden>
        <NotificationsView onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
