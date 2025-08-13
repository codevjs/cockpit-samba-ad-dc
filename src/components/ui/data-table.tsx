import React, { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './table'
import { Button } from './button'
import { Input } from './input'
import { Skeleton } from './skeleton'
import { Alert, AlertDescription } from './alert'
import { Badge } from './badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './dropdown-menu'
import {
  ChevronUp,
  ChevronDown,
  Search,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  width?: string | number;
}

export interface DataTableAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ReactNode;
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  searchable?: boolean;
  searchPlaceholder?: string;
  actions?: DataTableAction<T>[];
  onRowClick?: (item: T) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
  selectable?: boolean;
  emptyMessage?: string;
  className?: string;
  pageSize?: number;
  pagination?: boolean;
  itemsPerPageOptions?: number[];
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function DataTable<T extends Record<string, any>> ({
  data,
  columns,
  loading = false,
  error = null,
  searchable = true,
  searchPlaceholder = 'Search...',
  actions = [],
  onRowClick,
  onSelectionChange,
  selectable = false,
  emptyMessage = 'No data found',
  className,
  pageSize = 10,
  pagination = false,
  itemsPerPageOptions = [5, 10, 25, 50]
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [selectedItems, setSelectedItems] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)

  // Get searchable columns
  const searchableColumns = useMemo(() =>
    columns.filter(col => col.searchable !== false),
  [columns]
  )

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchable) return data

    return data.filter(item =>
      searchableColumns.some(column => {
        const value = item[column.key as keyof T]
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, searchable, searchableColumns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * currentPageSize
    return sortedData.slice(startIndex, startIndex + currentPageSize)
  }, [sortedData, currentPage, currentPageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / currentPageSize)

  const handleSort = (columnKey: string) => {
    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc'
          ? { key: columnKey, direction: 'desc' }
          : null
      }
      return { key: columnKey, direction: 'asc' }
    })
  }

  const handleSelectItem = (item: T, selected: boolean) => {
    const newSelectedItems = selected
      ? [...selectedItems, item]
      : selectedItems.filter(selectedItem => selectedItem !== item)

    setSelectedItems(newSelectedItems)
    onSelectionChange?.(newSelectedItems)
  }

  const handleSelectAll = (selected: boolean) => {
    const newSelectedItems = selected ? [...paginatedData] : []
    setSelectedItems(newSelectedItems)
    onSelectionChange?.(newSelectedItems)
  }

  const isSelected = (item: T) => selectedItems.includes(item)
  const allSelected = paginatedData.length > 0 && paginatedData.every(isSelected)
  const someSelected = selectedItems.length > 0 && !allSelected

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        {searchable && (
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        )}

        {pagination && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <select
              value={currentPageSize}
              onChange={(e) => {
                setCurrentPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="rounded border border-input bg-background px-2 py-1 text-sm"
            >
              {itemsPerPageOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    column.className,
                    column.sortable !== false && 'cursor-pointer select-none hover:bg-muted/50'
                  )}
                  style={{ width: column.width }}
                  onClick={() => {
                    if (column.sortable !== false) {
                      handleSort(column.key as string)
                    }
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable !== false && sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc'
                        ? (
                        <ChevronUp className="h-4 w-4" />
                          )
                        : (
                        <ChevronDown className="h-4 w-4" />
                          )
                    )}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-20">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0
              ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
                )
              : (
                  paginatedData.map((item, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-muted/50',
                    isSelected(item) && 'bg-muted/50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected(item)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectItem(item, e.target.checked)
                        }}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : item[column.key as keyof T]?.toString() || '—'
                      }
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions
                            .filter(action => !action.hidden?.(item))
                            .map((action, actionIndex) => (
                              <React.Fragment key={actionIndex}>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    action.onClick(item)
                                  }}
                                  disabled={action.disabled?.(item)}
                                  className={cn(
                                    action.variant === 'destructive' &&
                                    'text-destructive focus:text-destructive'
                                  )}
                                >
                                  {action.icon && (
                                    <span className="mr-2">{action.icon}</span>
                                  )}
                                  {action.label}
                                </DropdownMenuItem>
                                {actionIndex < actions.length - 1 && (
                                  <DropdownMenuSeparator />
                                )}
                              </React.Fragment>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * currentPageSize) + 1} to{' '}
            {Math.min(currentPage * currentPageSize, sortedData.length)} of{' '}
            {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Selection Info */}
      {selectable && selectedItems.length > 0 && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedItems.length} selected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItems([])
              onSelectionChange?.([])
            }}
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  )
}
