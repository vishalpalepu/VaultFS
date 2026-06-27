"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "secondary";
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm text-neutral-300 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 border-t border-neutral-800/80 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={loading}
            className="text-xs px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm();
              onClose();
            }}
            loading={loading}
            className="text-xs px-4 py-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
