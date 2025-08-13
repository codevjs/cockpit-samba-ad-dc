import React, { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useUserMutations } from './hooks/useUserMutations'
import { ErrorToast, SuccessToast } from '@/common'
import type { SambaUser } from '@/types/samba'

interface DeleteUserDialogProps {
    user?: SambaUser;
    username?: string;
    onUserDeleted?: (username: string) => void;
    trigger?: React.ReactNode;
}

export default function DeleteUserDialog ({
  user,
  username: propUsername,
  onUserDeleted,
  trigger
}: DeleteUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmUsername, setConfirmUsername] = useState('')
  const [showToasts, setShowToasts] = useState({ success: false, error: false })

  const username = user?.username || propUsername || ''
  const displayName = user?.displayName || user?.username || username

  const { delete: deleteUser, deleting, error, clearError } = useUserMutations({
    onSuccess: (action, data) => {
      if (action === 'delete') {
        setShowToasts({ success: true, error: false })
        setIsOpen(false)
        setConfirmUsername('')
        onUserDeleted?.(data.username)
      }
    },
    onError: () => {
      setShowToasts({ success: false, error: true })
    }
  })

  const handleDelete = async () => {
    if (confirmUsername !== username) {
      return
    }

    clearError()
    const success = await deleteUser(username)
    if (success) {
      setConfirmUsername('')
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setConfirmUsername('')
      clearError()
    }
  }

  const canDelete = confirmUsername === username && !deleting

  return (
        <>
            {showToasts.error && error && (
                <ErrorToast
                    errorMessage={error}
                    closeModal={() => setShowToasts({ ...showToasts, error: false })}
                />
            )}
            {showToasts.success && (
                <SuccessToast
                    successMessage={`User "${username}" has been deleted successfully.`}
                    closeModal={() => setShowToasts({ ...showToasts, success: false })}
                />
            )}

            <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
                <AlertDialogTrigger asChild>
                    {trigger || (
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                        </Button>
                    )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    Are you sure you want to delete the user account for <strong>"{displayName}"</strong>?
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    This action cannot be undone. The user will be permanently removed from Active Directory,
                                    and all associated permissions and group memberships will be lost.
                                </p>
                                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                    <p className="text-sm font-medium text-destructive">
                                        Warning: This will also affect any services or applications that depend on this user account.
                                    </p>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <Label htmlFor="confirm-username" className="text-sm font-medium">
                            To confirm, type the username "{username}" below:
                        </Label>
                        <Input
                            id="confirm-username"
                            type="text"
                            value={confirmUsername}
                            onChange={(e) => setConfirmUsername(e.target.value)}
                            placeholder={`Type "${username}" to confirm`}
                            className="mt-2"
                            autoComplete="off"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => handleOpenChange(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={!canDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting
                              ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    Deleting...
                                </>
                                )
                              : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                </>
                                )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
  )
}
