import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface Allocation {
    id: number;
    student_id: number;
    room_id: number;
    student_name: string;
    room_number: string;
    assigned_date: string;
}

const Allocations: React.FC = () => {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
    const [formStudent, setFormStudent] = useState<string | number>('');
    const [formRoom, setFormRoom] = useState<string | number>('');
    const [formDate, setFormDate] = useState<string>('');
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allocRes, stuRes, roomsRes] = await Promise.all([
                api.get('/allocations'),
                api.get('/students'),
                api.get('/rooms')
            ]);
            setAllocations(allocRes.data);
            setStudents(stuRes.data);
            setRooms(roomsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (modalMode === 'add') {
                await api.post('/allocations', { student_id: formStudent, room_id: formRoom });
            } else if (selectedAllocation) {
                await api.put(`/allocations/${selectedAllocation.id}`, {
                    student_id: formStudent,
                    room_id: formRoom,
                    assigned_date: new Date(formDate).toISOString()
                });
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed.');
        }
    };

    const handleRemove = async (id: number) => {
        try {
            await api.delete(`/allocations/${id}`);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    const getAvailableStudents = () => {
        if (modalMode === 'add') {
            return students.filter(s => !s.room_number);
        }
        return students.filter(s => !s.room_number || s.id === Number(formStudent));
    };

    const getAvailableRooms = () => {
        if (modalMode === 'add') {
            return rooms.filter(r => r.current_occupancy < r.capacity);
        }
        return rooms.filter(r => r.current_occupancy < r.capacity || r.id === Number(formRoom));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Room Allocations</h1>
                <button onClick={() => {
                    setModalMode('add');
                    setSelectedAllocation(null);
                    setFormStudent('');
                    setFormRoom('');
                    setFormDate(new Date().toISOString().substring(0, 10));
                    setShowModal(true);
                }} className="flex items-center space-x-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md hover:bg-primary/90 transition-all hover:shadow-primary/25">
                    <Plus className="w-5 h-5" /><span>Assign Student</span>
                </button>
            </div>

            <div className="bg-card/70 text-card-foreground backdrop-blur-2xl border border-border/60 rounded-[2rem] shadow-2xl shadow-primary/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                            <th className="p-5 border-b border-border">Student</th>
                            <th className="p-5 border-b border-border">Room</th>
                            <th className="p-5 border-b border-border">Date</th>
                            <th className="p-5 border-b border-border text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? <tr><td colSpan={4} className="p-12 text-center text-muted-foreground font-medium animate-pulse">Loading allocations...</td></tr> : allocations.map(alloc => (
                            <tr key={alloc.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-4 font-bold text-foreground">{alloc.student_name}</td>
                                <td className="px-5 py-4"><span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1">{alloc.room_number}</span></td>
                                <td className="px-5 py-4 text-muted-foreground">{new Date(alloc.assigned_date).toLocaleDateString()}</td>
                                <td className="px-5 py-4 text-right space-x-3">
                                    <button onClick={() => {
                                        setModalMode('edit');
                                        setSelectedAllocation(alloc);
                                        setFormStudent(alloc.student_id);
                                        setFormRoom(alloc.room_id);
                                        setFormDate(new Date(alloc.assigned_date).toISOString().substring(0, 10));
                                        setShowModal(true);
                                    }} className="text-secondary-foreground font-semibold text-sm hover:underline highlight">Edit</button>

                                    <AlertDialog>
                                        <AlertDialogTrigger >
                                            <button className="text-destructive font-semibold text-sm hover:underline">Revoke</button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 rounded-[2rem] shadow-2xl sm:max-w-md">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-xl font-black">Revoke Allocation?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground">
                                                    Do you really want to revoke this student's room allocation? The student will be removed from the room.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl font-semibold border-border hover:bg-muted/50 transition-colors">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRemove(alloc.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-semibold shadow-md transition-all">Confirm Revoke</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                        {allocations.length === 0 && !loading && (
                            <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">No allocations found. Create one above!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 shadow-2xl rounded-[2rem] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{modalMode === 'add' ? 'Assign Room' : 'Edit Allocation'}</DialogTitle>
                    </DialogHeader>
                    {error && <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium text-center">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Student</label>
                            <select required value={formStudent} onChange={(e) => setFormStudent(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm">
                                <option value="">-- Choose Student --</option>
                                {getAvailableStudents().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Room</label>
                            <select required value={formRoom} onChange={(e) => setFormRoom(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm">
                                <option value="">-- Choose Room --</option>
                                {getAvailableRooms().map(r => <option key={r.id} value={r.id}>Room {r.room_number} ({r.capacity - r.current_occupancy} beds)</option>)}
                            </select>
                        </div>
                        {modalMode === 'edit' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">Date</label>
                                <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" />
                            </div>
                        )}
                        <div className="flex space-x-3 pt-6">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-border bg-background rounded-xl text-foreground font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-all hover:shadow-primary/25">Confirm</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Allocations;
