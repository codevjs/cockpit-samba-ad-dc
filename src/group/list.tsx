import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { MoreHorizontal, Users, Shield, Globe, Building, Trash2, Info, FolderOpen, UserPlus, UserMinus } from 'lucide-react'

import { DataTable, DataTableColumn } from '@/components/ui/data-table'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import type { SambaGroup } from '@/types/samba'
import DeleteGroupDialog from './delete'
import GroupDetailsDialog from './show'
import MoveGroupDialog from './move'
import ListMembersDialog from './listmembers'
import RemoveMembersDialog from './removemembers'

interface GroupListProps {
  groups?: SambaGroup[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

interface GroupActionsProps {
  group: SambaGroup;
  onRefresh: () => void;
}

const GroupActions: React.FC<GroupActionsProps> = ({ group, onRefresh }) => {
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

        <GroupDetailsDialog
          groupName={group.name}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Info className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          }
        />

        <ListMembersDialog
          groupName={group.name}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UserPlus className="mr-2 h-4 w-4" />
              View Members
            </DropdownMenuItem>
          }
        />

        <RemoveMembersDialog
          groupName={group.name}
          onMembersRemoved={onRefresh}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Members
            </DropdownMenuItem>
          }
        />

        <MoveGroupDialog
          groupName={group.name}
          onGroupMoved={onRefresh}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Move to OU
            </DropdownMenuItem>
          }
        />

        <DropdownMenuSeparator />

        <DeleteGroupDialog
          groupName={group.name}
          onGroupDeleted={onRefresh}
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Group
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const GroupList: React.FC<GroupListProps> = ({ groups = [], loading = false, error = null, onRefresh = () => {} }) => {
  const columns = useMemo<DataTableColumn<SambaGroup>[]>(() => [
    {
      key: 'name',
      header: 'Group Name',
      sortable: true,
      searchable: true,
      render: (group) => (
        <div className="font-medium flex items-center">
          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
          {group.name}
        </div>
      )
    },
    {
      key: 'groupType',
      header: 'Type',
      sortable: true,
      render: (group) => (
        <Badge variant={group.groupType === 'Security' ? 'default' : 'secondary'}>
          {group.groupType === 'Security'
            ? (
            <>
              <Shield className="mr-1 h-3 w-3" />
              Security
            </>
              )
            : (
            <>
              <Globe className="mr-1 h-3 w-3" />
              Distribution
            </>
              )}
        </Badge>
      )
    },
    {
      key: 'groupScope',
      header: 'Scope',
      sortable: true,
      render: (group) => {
        const scopeIcon = {
          DomainLocal: Building,
          Global: Globe,
          Universal: Shield
        }[group.groupScope]

        const IconComponent = scopeIcon || Building

        return (
          <div className="flex items-center text-sm">
            <IconComponent className="mr-1 h-3 w-3 text-muted-foreground" />
            {group.groupScope}
          </div>
        )
      }
    },
    {
      key: 'description',
      header: 'Description',
      searchable: true,
      render: (group) => (
        <div className="text-sm max-w-[300px] truncate">
          {group.description || <span className="text-muted-foreground">-</span>}
        </div>
      )
    },
    {
      key: 'members',
      header: 'Members',
      sortable: true,
      render: (group) => {
        const memberCount = group.members?.length || 0
        return (
          <div className="text-sm">
            <div className="font-medium">{memberCount}</div>
            {memberCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {memberCount === 1 ? 'member' : 'members'}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (group) => (
        <div className="text-sm">
          {format(group.createdAt, 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (group) => <GroupActions group={group} onRefresh={onRefresh} />
    }
  ], [onRefresh])

  if (error) {
    return (
      <ErrorAlert
        error={error}
        title="Failed to load groups"
        onRetry={onRefresh}
        retryLabel="Retry Loading"
      />
    )
  }

  return (
    <DataTable
      data={groups}
      columns={columns}
      loading={loading}
      searchable
      searchPlaceholder="Search groups by name or description..."
      emptyMessage="No groups found"
    />
  )
}

export default GroupList
