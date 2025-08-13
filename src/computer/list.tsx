import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Monitor, Power, PowerOff, MoreHorizontal, RefreshCw, Trash2, FolderOpen, Info } from 'lucide-react';

import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { useComputers } from './hooks/useComputers';
import { useComputerMutations } from './hooks/useComputerMutations';
import type { SambaComputer } from '@/types/samba';

// Import dialogs that will be created
import CreateComputerDialog from './create';
import DeleteComputerDialog from './delete';
import MoveComputerDialog from './move';
import ShowComputerDialog from './show';

interface ComputerListProps {
    computers?: SambaComputer[];
    loading?: boolean;
    error?: string | null;
    onRefresh?: () => void;
}

interface ComputerActionsProps {
  computer: SambaComputer;
  onRefresh: () => void;
  onEnableDisable: (computer: SambaComputer) => void;
  isUpdating: boolean;
}

const ComputerActions: React.FC<ComputerActionsProps> = ({ computer, onRefresh, onEnableDisable, isUpdating }) => {
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
        
        <ShowComputerDialog 
          computerName={computer.name}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Info className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          }
        />
        
        <DropdownMenuItem 
          onClick={() => onEnableDisable(computer)}
          disabled={isUpdating}
        >
          {computer.enabled ? (
            <>
              <PowerOff className="mr-2 h-4 w-4" />
              Disable Computer
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" />
              Enable Computer
            </>
          )}
        </DropdownMenuItem>
        
        <MoveComputerDialog 
          computerName={computer.name}
          onComputerMoved={onRefresh}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Move to OU
            </DropdownMenuItem>
          }
        />
        
        <DropdownMenuSeparator />
        
        <DeleteComputerDialog 
          computerName={computer.name}
          onComputerDeleted={onRefresh}
          trigger={
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Computer
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function ComputerList({ 
    computers: propComputers,
    loading: propLoading,
    error: propError,
    onRefresh: propOnRefresh
}: ComputerListProps) {
    // Use either prop data or hook data
    const hookData = useComputers({
        initialFilters: {},
        autoRefresh: true,
    });

    const computers = propComputers || hookData.filteredComputers;
    const loading = propLoading !== undefined ? propLoading : hookData.loading;
    const error = propError !== undefined ? propError : hookData.error;
    const onRefresh = propOnRefresh || hookData.refreshComputers;

    const { enable, disable, enablingDisabling, error: mutationError } = useComputerMutations({
        onSuccess: (action, data) => {
            onRefresh();
        },
        onError: (action, error) => {
            console.error(`Failed to ${action} computer:`, error);
        }
    });

    const handleEnableDisable = async (computer: SambaComputer) => {
        if (computer.enabled) {
            await disable(computer.name);
        } else {
            await enable(computer.name);
        }
    };

    const columns = useMemo<DataTableColumn<SambaComputer>[]>(() => [
        {
            key: 'name',
            header: 'Computer Name',
            sortable: true,
            searchable: true,
            render: (computer) => (
                <div className="font-medium flex items-center">
                    <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                    {computer.name}
                </div>
            ),
        },
        {
            key: 'dnsHostName',
            header: 'DNS Host Name',
            sortable: true,
            searchable: true,
            render: (computer) => (
                <div className="text-sm">
                    {computer.dnsHostName || <span className="text-muted-foreground">-</span>}
                </div>
            ),
        },
        {
            key: 'operatingSystem',
            header: 'Operating System',
            sortable: true,
            render: (computer) => (
                <div className="text-sm">
                    <div>{computer.operatingSystem || <span className="text-muted-foreground">Unknown</span>}</div>
                    {computer.operatingSystemVersion && (
                        <div className="text-xs text-muted-foreground">
                            {computer.operatingSystemVersion}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'enabled',
            header: 'Status',
            sortable: true,
            render: (computer) => (
                <Badge variant={computer.enabled ? 'default' : 'secondary'}>
                    {computer.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
            ),
        },
        {
            key: 'lastLogon',
            header: 'Last Logon',
            sortable: true,
            render: (computer) => {
                if (!computer.lastLogon) {
                    return <span className="text-muted-foreground text-sm">Never</span>;
                }
                
                const now = new Date();
                const diffInMs = now.getTime() - computer.lastLogon.getTime();
                const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                
                if (diffInDays === 0) {
                    return (
                        <div className="text-sm">
                            <div className="text-green-600 font-medium">Today</div>
                            <div className="text-xs text-muted-foreground">
                                {format(computer.lastLogon, 'HH:mm')}
                            </div>
                        </div>
                    );
                }
                
                if (diffInDays <= 7) {
                    return (
                        <div className="text-sm">
                            <div className="text-blue-600 font-medium">
                                {diffInDays === 1 ? 'Yesterday' : `${diffInDays} days ago`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {format(computer.lastLogon, 'MMM dd, HH:mm')}
                            </div>
                        </div>
                    );
                }
                
                return (
                    <div className="text-sm">
                        <div className={`font-medium ${diffInDays > 90 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                            {format(computer.lastLogon, 'MMM dd, yyyy')}
                        </div>
                        {diffInDays > 90 && (
                            <div className="text-xs text-yellow-600">Inactive</div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (computer) => (
                <ComputerActions 
                    computer={computer} 
                    onRefresh={onRefresh}
                    onEnableDisable={handleEnableDisable}
                    isUpdating={enablingDisabling}
                />
            ),
        },
    ], [onRefresh, handleEnableDisable, enablingDisabling]);

    if (error) {
        return (
            <ErrorAlert
                error={error}
                title="Failed to load computers"
                onRetry={onRefresh}
                retryLabel="Retry Loading"
            />
        );
    }

    return (
        <DataTable
            data={computers}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search computers by name, DNS name, or description..."
            emptyMessage="No computers found"
        />
    );
}