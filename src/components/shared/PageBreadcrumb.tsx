import { Link, useLocation } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

const routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/browse': 'Browse Skills',
    '/requests': 'Requests',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/help': 'Help & Support',
    '/chat': 'Chat',
    '/onboarding': 'Onboarding',
    '/safety': 'Safety Center',
    '/guidelines': 'Community Guidelines',
};

export function PageBreadcrumb() {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Build breadcrumb items
    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);

        if (index === pathSegments.length - 1) {
            items.push({ label });
        } else {
            items.push({ label, href: currentPath });
        }
    });

    // Don't show breadcrumb on dashboard home
    if (location.pathname === '/dashboard') {
        return null;
    }

    return (
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-400 transition-colors">
                            <Home className="h-3.5 w-3.5" />
                            <span>Home</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {items.map((item, index) => (
                    <div key={index} className="contents">
                        <BreadcrumbSeparator className="text-gray-600" />
                        <BreadcrumbItem>
                            {item.href ? (
                                <BreadcrumbLink asChild>
                                    <Link to={item.href} className="text-gray-400 hover:text-indigo-400 transition-colors">
                                        {item.label}
                                    </Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage className="text-gray-200 font-medium">
                                    {item.label}
                                </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default PageBreadcrumb;
