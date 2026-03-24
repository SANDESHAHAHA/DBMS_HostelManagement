import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Building2, CalendarDays, User, BedDouble } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    const [formStudent, setFormStudent] = useState('');
    const [formRoom, setFormRoom] = useState('');
    const [formDate, setFormDate] = useState('');
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allocRes, stuRes, roomsRes] = await Promise.all([
                api.get('/allocations'),
                api.get('/students'),
                api.get('/rooms'),
            ]);
            setAllocations(allocRes.data);
            setStudents(stuRes.data);
            setRooms(roomsRes.data);
        } catch (err) {
            console.error(err);
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
                    assigned_date: new Date(formDate).toISOString(),
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

    const getAvailableStudents = () =>
        modalMode === 'add'
            ? students.filter(s => !s.room_number)
            : students.filter(s => !s.room_number || s.id === Number(formStudent));

    const getAvailableRooms = () =>
        modalMode === 'add'
            ? rooms.filter(r => r.current_occupancy < r.capacity)
            : rooms.filter(r => r.current_occupancy < r.capacity || r.id === Number(formRoom));

    const openAddModal = () => {
        setModalMode('add');
        setSelectedAllocation(null);
        setFormStudent('');
        setFormRoom('');
        setFormDate(new Date().toISOString().substring(0, 10));
        setError('');
        setShowModal(true);
    };

    const openEditModal = (alloc: Allocation) => {
        setModalMode('edit');
        setSelectedAllocation(alloc);
        setFormStudent(String(alloc.student_id));
        setFormRoom(String(alloc.room_id));
        setFormDate(new Date(alloc.assigned_date).toISOString().substring(0, 10));
        setError('');
        setShowModal(true);
    };

    return (
        <div className="space-y-6 p-6 animate-in fade-in duration-500">

            {/* ── Page header ── */}
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Room Allocations</h1>
                    <p className="text-sm text-muted-foreground">Manage and track student room assignments</p>
                </div>
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Assign Student
                </Button>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Allocations', value: allocations.length, icon: <BedDouble className="h-4 w-4 text-muted-foreground" /> },
                    { label: 'Students Assigned', value: new Set(allocations.map(a => a.student_id)).size, icon: <User className="h-4 w-4 text-muted-foreground" /> },
                    { label: 'Rooms Occupied', value: new Set(allocations.map(a => a.room_number)).size, icon: <Building2 className="h-4 w-4 text-muted-foreground" /> },
                ].map(stat => (
                    <Card key={stat.label} className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                            <CardDescription className="text-xs font-medium uppercase tracking-wider">{stat.label}</CardDescription>
                            {stat.icon}
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {loading
                                ? <Skeleton className="h-7 w-10" />
                                : <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            }
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Main table card ── */}
            <Card className="shadow-sm overflow-hidden">
                <CardHeader className="px-6 pt-5 pb-4">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Active Allocations
                    </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead>Student</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Assigned Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : allocations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                                        No allocations yet —{' '}
                                        <button
                                            onClick={openAddModal}
                                            className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                                        >
                                            assign a student
                                        </button>{' '}
                                        to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                allocations.map(alloc => (
                                    <TableRow key={alloc.id}>
                                        {/* Student */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {/* Ring uses --primary (#aff33e) */}
                                                <div className="h-8 w-8 rounded-full bg-primary/15 ring-1 ring-primary/50 flex items-center justify-center shrink-0">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-medium text-foreground">{alloc.student_name}</span>
                                            </div>
                                        </TableCell>

                                        {/* Room — secondary = slate-700 bg with white text */}
                                        <TableCell>
                                            <Badge variant="secondary" className="gap-1.5 font-semibold">
                                                <Building2 className="h-3 w-3" />
                                                {alloc.room_number}
                                            </Badge>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {new Date(alloc.assigned_date).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                })}
                                            </div>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(alloc)}
                                                    className="h-8 px-3 text-xs font-semibold"
                                                >
                                                    Edit
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            Revoke
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Revoke Allocation?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will remove <strong>{alloc.student_name}</strong> from room{' '}
                                                                <strong>{alloc.room_number}</strong>. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleRemove(alloc.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Confirm Revoke
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ── Assign / Edit dialog ── */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {modalMode === 'add' ? 'Assign Room' : 'Edit Allocation'}
                        </DialogTitle>
                        <DialogDescription>
                            {modalMode === 'add'
                                ? 'Select an unassigned student and an available room.'
                                : 'Update the student, room, or assignment date.'}
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 pt-1">

                        {/* Student */}
                        <div className="space-y-1.5">
                            <Label htmlFor="student">Student</Label>
                            <Select required value={formStudent} onValueChange={(value) => value !== null && setFormStudent(value)}>
                                <SelectTrigger id="student">
                                    <SelectValue placeholder="Choose a student…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableStudents().length === 0 ? (
                                        <SelectItem value="__none__" disabled>No unassigned students</SelectItem>
                                    ) : getAvailableStudents().map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Room */}
                        <div className="space-y-1.5">
                            <Label htmlFor="room">Room</Label>
                            <Select required value={formRoom} onValueChange={(value) => value !== null && setFormRoom(value)}>
                                <SelectTrigger id="room">
                                    <SelectValue placeholder="Choose a room…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableRooms().length === 0 ? (
                                        <SelectItem value="__none__" disabled>No rooms available</SelectItem>
                                    ) : getAvailableRooms().map(r => (
                                        <SelectItem key={r.id} value={String(r.id)}>
                                            Room {r.room_number}
                                            <span className="ml-2 text-muted-foreground text-xs">
                                                — {r.capacity - r.current_occupancy} bed{r.capacity - r.current_occupancy !== 1 ? 's' : ''} free
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date (edit only) */}
                        {modalMode === 'edit' && (
                            <div className="space-y-1.5">
                                <Label htmlFor="date">Assigned Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    required
                                    value={formDate}
                                    onChange={e => setFormDate(e.target.value)}
                                />
                            </div>
                        )}

                        <DialogFooter className="pt-2 gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1">
                                {modalMode === 'add' ? 'Assign' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Allocations;