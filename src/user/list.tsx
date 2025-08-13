import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, User, UserCheck, UserX, Key, Calendar, FolderOpen } from 'lucide-react';

import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { SambaUser } from '@/types/samba';
import DeleteUserDialog from './delete';
import ShowUserDialog from './show';
import ChangePasswordDialog from './password';
import SetExpiryDialog from './setexpiry';
import MoveUserDialog from './move';
import UserStatusToggle from './status-toggle';

interface UserListProps {
  users: SambaUser[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

interface UserActionsProps {
  user: SambaUser;
  onRefresh: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({ user, onRefresh }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ShowUserDialog 
          username={user.username}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <User className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          }
        />
        
        <UserStatusToggle 
          user={user}
          onStatusChanged={onRefresh}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              {user.enabled ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Disable User
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Enable User
                </>
              )}
            </DropdownMenuItem>
          }
        />
        
        <ChangePasswordDialog 
          username={user.username}
          mode="admin"
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </DropdownMenuItem>
          }
        />
        
        <SetExpiryDialog 
          username={user.username}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Calendar className="mr-2 h-4 w-4" />
              Set Expiry
            </DropdownMenuItem>
          }
        />
        
        <MoveUserDialog 
          username={user.username}
          onUserMoved={onRefresh}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Move to OU
            </DropdownMenuItem>
          }
        />
        
        <DropdownMenuSeparator />
        
        <DeleteUserDialog 
          username={user.username}
          onUserDeleted={onRefresh}
          trigger={
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserList: React.FC<UserListProps> = ({ users, loading, error, onRefresh }) => {
  const columns = useMemo<DataTableColumn<SambaUser>[]>(() => [
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      searchable: true,
      render: (user) => (
        <div className="font-medium">{user.username}</div>
      ),
    },
    {
      key: 'displayName',
      header: 'Display Name',
      sortable: true,
      searchable: true,
      render: (user) => {
        const displayName = user.displayName || 
          (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '');
        return <div>{displayName || '-'}</div>;
      },
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      searchable: true,
      render: (user) => {
        return user.email ? (
          <a 
            href={`mailto:${user.email}`} 
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {user.email}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      key: 'enabled',
      header: 'Status',
      sortable: true,
      render: (user) => (
        <Badge variant={user.enabled ? 'default' : 'secondary'}>
          {user.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'groups',
      header: 'Groups',
      render: (user) => {
        if (!user.groups || user.groups.length === 0) {
          return <span className="text-muted-foreground">None</span>;
        }
        
        if (user.groups.length === 1) {
          return <Badge variant="outline">{user.groups[0]}</Badge>;
        }
        
        return (
          <div className="flex items-center gap-1">
            <Badge variant="outline">{user.groups[0]}</Badge>
            {user.groups.length > 1 && (
              <Badge variant="outline" className="text-xs">
                +{user.groups.length - 1}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      render: (user) => {
        return user.lastLogin ? (
          <span className="text-sm">
            {format(user.lastLogin, 'MMM dd, yyyy HH:mm')}
          </span>
        ) : (
          <span className="text-muted-foreground">Never</span>
        );
      },
    },
    {
      key: 'accountExpires',
      header: 'Expires',
      sortable: true,
      render: (user) => {
        if (!user.accountExpires) {
          return <span className="text-muted-foreground">Never</span>;
        }
        
        const isExpired = user.accountExpires.getTime() < Date.now();
        const isExpiringSoon = user.accountExpires.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days
        
        return (
          <div className="text-sm">
            <span className={
              isExpired ? 'text-red-600 font-medium' :
              isExpiringSoon ? 'text-yellow-600 font-medium' :
              'text-muted-foreground'
            }>
              {format(user.accountExpires, 'MMM dd, yyyy')}
            </span>
            {isExpired && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Expired
              </Badge>
            )}
            {!isExpired && isExpiringSoon && (
              <Badge variant="secondary" className="ml-2 text-xs bg-yellow-100 text-yellow-800">
                Soon
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => <UserActions user={user} onRefresh={onRefresh} />,
    },
  ], [onRefresh]);

  if (error) {
    return (
      <ErrorAlert
        error={error}
        title="Failed to load users"
        onRetry={onRefresh}
        retryLabel="Retry Loading"
      />
    );
  }

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={loading}
      searchable
      searchPlaceholder="Search users by username, name, or email..."
      emptyMessage="No users found"
    />
  );
};

export default UserList;
