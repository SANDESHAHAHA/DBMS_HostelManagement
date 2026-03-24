import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Bed, Bookmark, CreditCard, LogOut, X, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const links = [
        { to: '/dashboard', icon: Home, label: 'Overview' },
        { to: '/dashboard/rooms', icon: Bed, label: 'Rooms' },
        { to: '/dashboard/students', icon: Users, label: 'Students' },
        { to: '/dashboard/allocations', icon: Bookmark, label: 'Allocations' },
        { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    ];

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in" 
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shadow-2xl transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none h-screen",
                isOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "w-24" : "w-72"
            )}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-sm">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        {!isCollapsed && (
                            <h1 className="text-xl font-black tracking-tight whitespace-nowrap animate-in fade-in duration-300">
                                Hostel<span className="text-primary">Sys</span>
                            </h1>
                        )}
                    </div>
                    <button 
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-sidebar-accent"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Desktop Collapse Toggle */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-20 bg-primary border text-primary-foreground border-border rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-transform"
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
                    {!isCollapsed && <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Menu</p>}
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/dashboard'}
                            onClick={() => setIsOpen(false)}
                            title={isCollapsed ? link.label : undefined}
                            className={({ isActive }) => cn(
                                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all font-medium text-sm group relative overflow-hidden",
                                isActive 
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && !isCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />}
                                    <link.icon className={cn(
                                        "w-5 h-5 shrink-0 transition-colors", 
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                                        isCollapsed && "mx-auto"
                                    )} />
                                    {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-sidebar-border">
                    <div className={cn(
                        "bg-sidebar-accent/50 border border-sidebar-border rounded-2xl mb-4 transition-all overflow-hidden flex items-center",
                        isCollapsed ? "p-2 justify-center" : "p-3 gap-3"
                    )}>
                        <div className="relative shrink-0">
                            <img 
                                src={`https://api.dicebear.com/9.x/micah/svg?seed=${localStorage.getItem('username') || 'Guest'}`} 
                                alt="User" 
                                className="w-10 h-10 rounded-full bg-background border border-border shadow-sm"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-sidebar-accent rounded-full"></span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-foreground truncate">{localStorage.getItem('username') || 'Guest'}</span>
                                <span className="text-xs font-medium text-muted-foreground truncate uppercase tracking-wider">Admin</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? "Sign Out" : undefined}
                        className={cn(
                            "flex items-center gap-3 w-full py-3 text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all",
                            isCollapsed ? "justify-center px-0" : "px-4"
                        )}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
