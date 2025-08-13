import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Menu,
  X,
  Users,
  Monitor,
  UserCheck,
  Building,
  Globe,
  Shield,
  FolderTree,
  Settings,
  ChevronRight,
  ChevronDown,
  Server
} from 'lucide-react'
import { SambaLogo } from './samba-logo'

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: Server,
    description: 'Overview and status'
  },
  {
    key: 'users',
    label: 'Users',
    path: '/users',
    icon: Users,
    description: 'Manage user accounts'
  },
  {
    key: 'computers',
    label: 'Computers',
    path: '/computers',
    icon: Monitor,
    description: 'Computer accounts'
  },
  {
    key: 'groups',
    label: 'Groups',
    path: '/groups',
    icon: UserCheck,
    description: 'Security and distribution groups'
  },
  {
    key: 'domain',
    label: 'Domain',
    path: '/domain',
    icon: Building,
    description: 'Domain configuration',
    children: [
      {
        key: 'domain-info',
        label: 'Information',
        path: '/domain/info',
        icon: Building,
        description: 'Domain details'
      },
      {
        key: 'domain-backup',
        label: 'Backup',
        path: '/domain/backup',
        icon: Shield,
        description: 'Backup operations'
      },
      {
        key: 'domain-trust',
        label: 'Trust',
        path: '/domain/trust',
        icon: Shield,
        description: 'Trust relationships'
      }
    ]
  },
  {
    key: 'dns',
    label: 'DNS',
    path: '/dns',
    icon: Globe,
    description: 'DNS zones and records'
  },
  {
    key: 'ou',
    label: 'Organizational Units',
    path: '/organizational-units',
    icon: FolderTree,
    description: 'OU management'
  },
  {
    key: 'gpo',
    label: 'Group Policy',
    path: '/group-policy',
    icon: Settings,
    description: 'Group Policy Objects'
  }
]

interface SidebarProps {
  isOpen: boolean;
  activeItem: string;
  onItemClick: (item: NavigationItem) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeItem, onItemClick, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key)
        ? prev.filter(item => item !== key)
        : [...prev, key]
    )
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = activeItem === item.key
    const isExpanded = expandedItems.includes(item.key)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.key}>
        <div
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
            level > 0 && 'ml-4',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.key)
            } else {
              onItemClick(item)
              onClose()
            }
          }}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && level === 0 && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          {hasChildren && (
            <div className="ml-2">
              {isExpanded
                ? (
                <ChevronDown className="h-4 w-4" />
                  )
                : (
                <ChevronRight className="h-4 w-4" />
                  )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <SambaLogo className="h-8 w-8" />
              <div>
                <h1 className="font-semibold text-lg">Samba AD DC</h1>
                <p className="text-xs text-muted-foreground">Management Console</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map(item => renderNavigationItem(item))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Version 0.1.0</div>
              <div>© 2024 Samba AD DC</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          {title && (
            <>
              <Separator orientation="vertical" className="h-6 lg:hidden" />
              <h1 className="text-xl font-semibold">{title}</h1>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Connected
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export interface AppLayoutProps {
  children?: React.ReactNode;
  title?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('dashboard')

  const handleItemClick = (item: NavigationItem) => {
    setActiveItem(item.key)
    // Navigation will be handled by React Router
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
