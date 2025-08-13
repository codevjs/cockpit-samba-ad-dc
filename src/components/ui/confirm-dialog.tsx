import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './alert-dialog'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { AlertTriangle, Trash2, Info, HelpCircle } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'info';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  children?: React.ReactNode;
}

const variantConfig = {
  default: {
    icon: HelpCircle,
    iconClassName: 'text-blue-500',
    confirmClassName: ''
  },
  destructive: {
    icon: Trash2,
    iconClassName: 'text-destructive',
    confirmClassName: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'text-orange-500',
    confirmClassName: 'bg-orange-500 text-white hover:bg-orange-600'
  },
  info: {
    icon: Info,
    iconClassName: 'text-blue-500',
    confirmClassName: 'bg-blue-500 text-white hover:bg-blue-600'
  }
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon,
  loading = false,
  disabled = false,
  onConfirm,
  onCancel,
  children
}) => {
  const config = variantConfig[variant]
  const IconComponent = config.icon

  const handleConfirm = async () => {
    if (loading || disabled) return

    try {
      await onConfirm()
    } catch (error) {
      // Error handling should be done by the parent component
      console.error('Confirmation action failed:', error)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            {icon || (
              <IconComponent className={cn('h-6 w-6', config.iconClassName)} />
            )}
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left mt-2">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={loading}
            className="mt-3 sm:mt-0"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || disabled}
            className={cn(
              config.confirmClassName,
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading
              ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                <span>Loading...</span>
              </div>
                )
              : (
                  confirmLabel
                )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Specific confirmation dialogs for common use cases
export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  itemType?: string;
  message?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  itemName,
  itemType = 'item',
  message,
  loading = false,
  onConfirm,
  onCancel
}) => {
  const defaultTitle = title || `Delete ${itemType}`
  const defaultMessage = message ||
    (itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
    )

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={defaultTitle}
      message={defaultMessage}
      confirmLabel={`Delete ${itemType}`}
      cancelLabel="Cancel"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

export interface BulkDeleteConfirmDialogProps {
  isOpen: boolean;
  count: number;
  itemType?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const BulkDeleteConfirmDialog: React.FC<BulkDeleteConfirmDialogProps> = ({
  isOpen,
  count,
  itemType = 'items',
  loading = false,
  onConfirm,
  onCancel
}) => {
  const title = `Delete ${count} ${itemType}`
  const message = `Are you sure you want to delete ${count} ${itemType}? This action cannot be undone.`

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message}
      confirmLabel={`Delete ${count} ${itemType}`}
      cancelLabel="Cancel"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

// Hook for managing confirmation dialog state
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const openDialog = () => setIsOpen(true)
  const closeDialog = () => {
    setIsOpen(false)
    setLoading(false)
  }

  const confirmWithLoading = async (action: () => Promise<void>) => {
    try {
      setLoading(true)
      await action()
      closeDialog()
    } catch (error) {
      setLoading(false)
      throw error // Re-throw so parent can handle
    }
  }

  return {
    isOpen,
    loading,
    openDialog,
    closeDialog,
    confirmWithLoading
  }
}

export default ConfirmDialog
