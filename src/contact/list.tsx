import React, { useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ErrorAlert } from '@/components/ui/error-alert';
import { 
  MoreVertical, 
  Eye, 
  Trash2, 
  Move,
  Mail,
  Phone,
  Contact as ContactIcon,
  Building2
} from 'lucide-react';
import type { SambaContact } from '@/types/samba';

interface ContactListProps {
  contacts: SambaContact[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onShowContact: (contactName: string) => void;
  onDeleteContact: (contactName: string) => void;
  onMoveContact: (contactName: string) => void;
}

export function ContactList({
  contacts,
  loading,
  error,
  onRefresh,
  onShowContact,
  onDeleteContact,
  onMoveContact,
}: ContactListProps) {
  const columns = useMemo<DataTableColumn<SambaContact>[]>(() => [
    {
      key: 'name',
      header: 'Contact Name',
      sortable: true,
      searchable: true,
      render: (contact) => (
        <div className="font-medium flex items-center">
          <ContactIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{contact.displayName || contact.name}</div>
            {contact.givenName && contact.surname && (
              <div className="text-sm text-muted-foreground">
                {contact.givenName} {contact.surname}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'contact_info',
      header: 'Contact Information',
      render: (contact) => (
        <div className="space-y-1">
          {contact.mail && (
            <div className="flex items-center text-sm">
              <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
              {contact.mail}
            </div>
          )}
          {contact.telephoneNumber && (
            <div className="flex items-center text-sm">
              <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
              {contact.telephoneNumber}
            </div>
          )}
          {!contact.mail && !contact.telephoneNumber && (
            <span className="text-sm text-muted-foreground">No contact info</span>
          )}
        </div>
      ),
    },
    {
      key: 'organizational_unit',
      header: 'Organizational Unit',
      sortable: true,
      render: (contact) => (
        <div className="flex items-center">
          <Building2 className="mr-1 h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {contact.organizationalUnit || 'Default'}
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (contact) => (
        <span className="text-sm text-muted-foreground">
          {contact.description || '-'}
        </span>
      ),
    },
    {
      key: 'created_date',
      header: 'Created',
      sortable: true,
      render: (contact) => (
        <span className="text-sm text-muted-foreground">
          {contact.createdAt.toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (contact) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onShowContact(contact.name)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMoveContact(contact.name)}>
              <Move className="mr-2 h-4 w-4" />
              Move to OU
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDeleteContact(contact.name)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [onShowContact, onDeleteContact, onMoveContact]);

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorAlert 
          error={error}
          onRetry={onRefresh}
          className="mb-4"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={contacts}
        columns={columns}
        loading={loading}
        emptyMessage="No contacts found. Create your first contact to get started."
      />
    </div>
  );
}