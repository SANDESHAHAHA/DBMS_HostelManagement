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

interface Student {
    id: number;
    name: string;
    contact: string;
    room_number?: string;
}

const Students: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newContact, setNewContact] = useState('');
    const [error, setError] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [editName, setEditName] = useState('');
    const [editContact, setEditContact] = useState('');
    const [editError, setEditError] = useState('');

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/students');
            setStudents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/students', { name: newName, contact: newContact });
            setIsAdding(false);
            setNewName('');
            setNewContact('');
            fetchStudents();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add student');
        }
    };

    const handleEditStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError('');
        if (!selectedStudent) return;
        try {
            await api.put(`/students/${selectedStudent.id}`, { name: editName, contact: editContact });
            setShowEditModal(false);
            fetchStudents();
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Failed to update student');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/students/${id}`);
            fetchStudents();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete student');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Student Directory</h1>
                <button onClick={() => setIsAdding(true)} className="flex items-center space-x-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md hover:bg-primary/90 transition-all hover:shadow-primary/25">
                    <Plus className="w-5 h-5" /><span>Add Student</span>
                </button>
            </div>

            <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 shadow-2xl rounded-[2rem] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Register Student</DialogTitle>
                    </DialogHeader>
                    {error && <p className="text-destructive bg-destructive/10 border border-destructive/20 text-sm p-3 rounded-lg font-medium">{error}</p>}
                    <form onSubmit={handleAddStudent} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Full Name</label>
                            <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Contact</label>
                            <input type="text" value={newContact} onChange={(e) => setNewContact(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" placeholder="+1 234 567 890" />
                        </div>
                        <div className="flex space-x-3 pt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-3 border border-border bg-background rounded-xl text-foreground font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-primary/90 transition-all font-semibold">Submit</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="bg-card/70 text-card-foreground backdrop-blur-2xl border border-border/60 rounded-[2rem] shadow-2xl shadow-primary/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                            <th className="p-5 border-b border-border">Name</th>
                            <th className="p-5 border-b border-border">Contact</th>
                            <th className="p-5 border-b border-border">Allocation Status</th>
                            <th className="p-5 border-b border-border text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? <tr><td colSpan={4} className="p-12 text-center text-muted-foreground font-medium animate-pulse">Loading directory...</td></tr> : students.map(student => (
                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-4 font-bold text-foreground">{student.name}</td>
                                <td className="px-5 py-4 text-muted-foreground">{student.contact || '-'}</td>
                                <td className="px-5 py-4">
                                    {student.room_number ?
                                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 inline-block">Room {student.room_number}</span> :
                                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-secondary/10 text-primary border border-secondary/20 inline-block">Unassigned</span>}
                                </td>
                                <td className="px-5 py-4 text-right space-x-3">
                                    <button onClick={() => { setSelectedStudent(student); setEditName(student.name); setEditContact(student.contact || ''); setShowEditModal(true); }} className="text-secondary-foreground font-semibold text-sm hover:underline highlight">Edit</button>

                                    <AlertDialog>
                                        <AlertDialogTrigger>
                                            <button className="text-destructive font-semibold text-sm hover:underline">Delete</button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 rounded-[2rem] shadow-2xl sm:max-w-md">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-xl font-black">Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground">
                                                    Do you really want to delete this student? All their allocations and payments will be permanently removed.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl font-semibold border-border hover:bg-muted/50 transition-colors">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-semibold shadow-md transition-all">Confirm Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && !loading && (
                            <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">No students found. Register one above!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 shadow-2xl rounded-[2rem] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Edit Student</DialogTitle>
                    </DialogHeader>
                    {editError && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium text-center">{editError}</div>}
                    <form onSubmit={handleEditStudent} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Full Name</label>
                            <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Contact</label>
                            <input type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" />
                        </div>
                        <div className="flex space-x-3 pt-4">
                            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 border border-border bg-background rounded-xl text-foreground font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-all hover:shadow-primary/25">Save</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Students;
