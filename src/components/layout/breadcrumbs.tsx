import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Dashboard', icon: Home }],
  '/users': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Users' }
  ],
  '/computers': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Computers' }
  ],
  '/groups': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Groups' }
  ],
  '/domain': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Domain' }
  ],
  '/domain/info': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Domain', path: '/domain' },
    { label: 'Information' }
  ],
  '/domain/backup': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Domain', path: '/domain' },
    { label: 'Backup' }
  ],
  '/domain/trust': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Domain', path: '/domain' },
    { label: 'Trust' }
  ],
  '/dns': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'DNS' }
  ],
  '/organizational-units': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Organizational Units' }
  ],
  '/group-policy': [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Group Policy' }
  ]
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  showHome = true
}) => {
  const location = useLocation()

  // Use provided items or derive from current route
  const breadcrumbItems = items || routeBreadcrumbs[location.pathname] || [
    { label: 'Dashboard', path: '/', icon: Home }
  ]

  // Filter out home if not requested
  const finalItems = showHome
    ? breadcrumbItems
    : breadcrumbItems.filter(item => item.path !== '/')

  if (finalItems.length === 0) {
    return null
  }

  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {finalItems.map((item, index) => {
          const isLast = index === finalItems.length - 1
          const IconComponent = item.icon

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}

              {item.path && !isLast
                ? (
                <Link
                  to={item.path}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
                  )
                : (
                <span className={cn(
                  'flex items-center space-x-1',
                  isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
                  )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Hook to generate breadcrumbs from route
export const useBreadcrumbs = (customItems?: BreadcrumbItem[]) => {
  const location = useLocation()

  return React.useMemo(() => {
    if (customItems) return customItems

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/', icon: Home }
    ]

    let currentPath = ''
    for (const segment of pathSegments) {
      currentPath += `/${segment}`
      const label = segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({
        label: label.replace('-', ' '),
        path: currentPath
      })
    }

    return breadcrumbs
  }, [location.pathname, customItems])
}

export default Breadcrumbs
