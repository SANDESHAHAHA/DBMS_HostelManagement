import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    const token = localStorage.getItem('token');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex bg-background min-h-screen relative overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border bg-card/50 backdrop-blur-md md:justify-end">
                    <button 
                        className="md:hidden p-2 text-foreground/70 hover:text-primary transition-colors hover:bg-muted/50 rounded-xl"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={toggleTheme} 
                        className="p-2.5 rounded-xl bg-muted/50 text-foreground/70 hover:text-primary hover:bg-muted shadow-sm transition-all border border-border/50"
                        title="Toggle theme"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </header>
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
