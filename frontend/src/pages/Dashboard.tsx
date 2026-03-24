import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users, Bed, Bookmark, Percent } from 'lucide-react';

interface Metrics {
    totalStudents: number;
    totalRooms: number;
    totalAllocations: number;
    totalCapacity: number;
    availableBeds: number;
    occupancyRate: number;
}

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-full ${colorClass}`}>
            <Icon className="w-8 h-8" />
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/dashboard/metrics');
                setMetrics(res.data);
            } catch (error) {
                console.error("Error fetching metrics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading metrics...</div>;
    if (!metrics) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={metrics.totalStudents} icon={Users} colorClass="bg-primary/10 text-primary" />
                <StatCard title="Total Rooms" value={metrics.totalRooms} icon={Bed} colorClass="bg-secondary/10 text-secondary" />
                <StatCard title="Allocations" value={metrics.totalAllocations} icon={Bookmark} colorClass="bg-accent/10 text-accent" />
                <StatCard title="Occupancy Rate" value={`${metrics.occupancyRate}%`} icon={Percent} colorClass="bg-primary/20 text-primary" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border">
                    <h3 className="text-xl font-bold mb-6">Capacity Status</h3>
                    <div className="flex items-center justify-between p-5 bg-muted rounded-xl border border-border/50">
                        <span className="text-muted-foreground font-medium">Total Bed Capacity</span>
                        <span className="font-bold text-2xl">{metrics.totalCapacity}</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-primary/5 rounded-xl border border-primary/20 mt-4">
                        <span className="text-primary font-medium">Available Beds</span>
                        <span className="font-bold text-primary text-2xl">{metrics.availableBeds}</span>
                    </div>
                </div>
                <div className="bg-card p-8 rounded-2xl shadow-sm border border-border flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent"></div>
                    <div className="text-center relative z-10">
                        <div className="w-40 h-40 rounded-full border-8 border-muted border-t-primary mx-auto flex items-center justify-center mb-6 shadow-xl shadow-primary/10">
                            <span className="text-4xl font-black text-primary">{metrics.occupancyRate}%</span>
                        </div>
                        <p className="text-muted-foreground font-semibold uppercase tracking-wider text-sm">Hostel Capacity Filled</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
