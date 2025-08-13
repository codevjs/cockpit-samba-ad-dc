import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Building,
    Mail,
    Clock,
    MapPin,
    Folder,
    Shield,
    Network,
    Server,
    Key,
    FileText,
    Settings,
    Database
} from 'lucide-react';

interface ManagementModule {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    href: string;
    status?: 'active' | 'warning' | 'error';
    badge?: string;
}

const managementModules: ManagementModule[] = [
    {
        id: 'users',
        title: 'User Management',
        description: 'Create, modify, and manage user accounts and permissions',
        icon: Users,
        href: 'user/user.html',
        status: 'active',
        badge: 'Core'
    },
    {
        id: 'computers',
        title: 'Computer Management',
        description: 'Manage domain-joined computers and their policies',
        icon: Building,
        href: 'computer/computer.html',
        status: 'active'
    },
    {
        id: 'groups',
        title: 'Group Management',
        description: 'Create and manage security and distribution groups',
        icon: Shield,
        href: 'group/group.html',
        status: 'active',
        badge: 'Core'
    },
    {
        id: 'domain',
        title: 'Domain Management',
        description: 'Configure domain settings, trust relationships, and policies',
        icon: Network,
        href: 'domain/domain.html',
        status: 'active',
        badge: 'Critical'
    },
    {
        id: 'dns',
        title: 'DNS Management',
        description: 'Manage DNS zones, records, and domain name resolution',
        icon: Database,
        href: 'dns/dns.html',
        status: 'active',
        badge: 'Core'
    },
    {
        id: 'sites',
        title: 'Sites Management',
        description: 'Configure Active Directory sites and subnets',
        icon: MapPin,
        href: 'sites/sites.html',
        status: 'active'
    },
    {
        id: 'ou',
        title: 'Organization Units',
        description: 'Create and manage organizational unit structure',
        icon: Folder,
        href: 'organization_unit/orgunit.html',
        status: 'active'
    },
    {
        id: 'gpo',
        title: 'Group Policy Objects',
        description: 'Manage and deploy group policies across the domain',
        icon: FileText,
        href: 'gpo/gpo.html',
        status: 'active',
        badge: 'Advanced'
    },
    {
        id: 'fsmo',
        title: 'FSMO Management',
        description: 'Manage Flexible Single Master Operations roles',
        icon: Server,
        href: 'fsmo/fsmo.html',
        status: 'active',
        badge: 'Advanced'
    },
    {
        id: 'spn',
        title: 'SPN Management',
        description: 'Manage Service Principal Names for authentication',
        icon: Key,
        href: 'spn/spn.html',
        status: 'active',
        badge: 'Advanced'
    },
    {
        id: 'delegation',
        title: 'Delegation Management',
        description: 'Configure delegation of authentication and permissions',
        icon: Settings,
        href: 'delegation/delegation.html',
        status: 'active',
        badge: 'Advanced'
    },
    {
        id: 'time',
        title: 'Time Configuration',
        description: 'Configure time synchronization and NTP settings',
        icon: Clock,
        href: 'time/time.html',
        status: 'active'
    },
    {
        id: 'contacts',
        title: 'Contact Management',
        description: 'Manage contact objects and address book entries',
        icon: Mail,
        href: 'contact/contact.html',
        status: 'active'
    },
    {
        id: 'forest',
        title: 'Forest Management',
        description: 'Manage forest-wide settings and configuration',
        icon: Database,
        href: 'forest/forest.html',
        status: 'active',
        badge: 'Advanced'
    },
    {
        id: 'dsacl',
        title: 'DS ACL Management',
        description: 'Manage Directory Service Access Control Lists',
        icon: Shield,
        href: 'dsacl/dsacl.html',
        status: 'active',
        badge: 'Expert'
    },
    {
        id: 'ntacl',
        title: 'NT ACL Management',
        description: 'Manage NTFS Access Control Lists on SYSVOL',
        icon: Shield,
        href: 'ntacl/ntacl.html',
        status: 'active',
        badge: 'Expert'
    }
];

const getStatusColor = (status?: string): string => {
    switch (status) {
        case 'active': return 'text-green-500';
        case 'warning': return 'text-yellow-500';
        case 'error': return 'text-red-500';
        default: return 'text-muted-foreground';
    }
};

const getBadgeVariant = (badge?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (badge) {
        case 'Core': return 'default';
        case 'Critical': return 'destructive';
        case 'Advanced': return 'secondary';
        case 'Expert': return 'outline';
        default: return 'secondary';
    }
};

export default function Main(): JSX.Element {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Samba AD DC Management</h1>
                <p className="text-muted-foreground mt-2">
                    Comprehensive Active Directory Domain Controller management interface
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {managementModules.map((module) => {
                    const IconComponent = module.icon;
                    return (
                        <Card
                            key={module.id}
                            className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/20"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-lg bg-primary/10 ${getStatusColor(module.status)}`}>
                                        <IconComponent className="h-5 w-5" />
                                    </div>
                                    {module.badge && (
                                        <Badge variant={getBadgeVariant(module.badge)} className="text-xs">
                                            {module.badge}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                    {module.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <CardDescription className="text-sm leading-relaxed mb-4">
                                    {module.description}
                                </CardDescription>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                    onClick={() => window.location.href = module.href}
                                >
                                    Manage
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">System Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">Active</div>
                        <div className="text-sm text-muted-foreground">Domain Controller</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{managementModules.length}</div>
                        <div className="text-sm text-muted-foreground">Management Modules</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">Ready</div>
                        <div className="text-sm text-muted-foreground">System Status</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
