// Re-export the ChangePasswordDialog component with admin mode as default
// This provides backward compatibility for setPassword functionality

import React from 'react'
import ChangePasswordDialog from './password'
import type { SambaUser } from '@/types/samba'

interface SetPasswordProps {
    user?: SambaUser;
    username?: string;
    onPasswordChanged?: (username: string) => void;
    trigger?: React.ReactNode;
}

export default function SetPassword (props: SetPasswordProps) {
  return <ChangePasswordDialog {...props} mode="admin" />
}
