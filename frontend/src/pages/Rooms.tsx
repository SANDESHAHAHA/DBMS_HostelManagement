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

interface Room {
    id: number;
    room_number: string;
    capacity: number;
    current_occupancy: number;
}

const Rooms: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCapacity, setFilterCapacity] = useState('');
    const [filterAvailable, setFilterAvailable] = useState(false);
    
    const [isAdding, setIsAdding] = useState(false);
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newCapacity, setNewCapacity] = useState<number | string>(1);
    const [error, setError] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [editRoomNumber, setEditRoomNumber] = useState('');
    const [editCapacity, setEditCapacity] = useState<number | string>(1);
    const [editError, setEditError] = useState('');

    const fetchRooms = async () => {
        setLoading(true);
        try {
            let url = '/rooms?';
            if (filterCapacity) url += `capacity=${filterCapacity}&`;
            if (filterAvailable) url += `available=true`;
            const res = await api.get(url);
            setRooms(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRooms(); }, [filterCapacity, filterAvailable]);

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/rooms', { room_number: newRoomNumber, capacity: Number(newCapacity) });
            setIsAdding(false);
            setNewRoomNumber('');
            setNewCapacity(1);
            fetchRooms();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add room');
        }
    };

    const handleEditRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError('');
        if (!selectedRoom) return;
        try {
            await api.put(`/rooms/${selectedRoom.id}`, { room_number: editRoomNumber, capacity: Number(editCapacity) });
            setShowEditModal(false);
            fetchRooms();
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Failed to update room');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/rooms/${id}`);
            fetchRooms();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete room');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Room Management</h1>
                <button onClick={() => setIsAdding(true)} className="flex items-center space-x-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md hover:bg-primary/90 transition-all hover:shadow-primary/25">
                    <Plus className="w-5 h-5" /><span>Add Room</span>
                </button>
            </div>

            <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 shadow-2xl rounded-[2rem] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">New Room</DialogTitle>
                    </DialogHeader>
                    {error && <p className="text-destructive bg-destructive/10 border border-destructive/20 text-sm p-3 rounded-lg font-medium">{error}</p>}
                    <form onSubmit={handleAddRoom} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Room Number</label>
                            <input type="text" required value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" placeholder="e.g. A-101" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Capacity</label>
                            <input type="number" min="1" required value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" />
                        </div>
                        <div className="flex space-x-3 pt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-3 border border-border bg-background rounded-xl text-foreground font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-primary/90 transition-all font-semibold">Save</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                            <th className="p-5 border-b border-border">Room Number</th>
                            <th className="p-5 border-b border-border">Capacity</th>
                            <th className="p-5 border-b border-border">Occupancy</th>
                            <th className="p-5 border-b border-border">Status</th>
                            <th className="p-5 border-b border-border text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? <tr><td colSpan={5} className="p-12 text-center text-muted-foreground font-medium animate-pulse">Loading rooms...</td></tr> : rooms.map(room => (
                            <tr key={room.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-4 font-bold text-foreground">{room.room_number}</td>
                                <td className="px-5 py-4 text-muted-foreground">{room.capacity} beds</td>
                                <td className="px-5 py-4 font-medium">{room.current_occupancy} / {room.capacity}</td>
                                <td className="px-5 py-4">
                                    {room.current_occupancy >= room.capacity ? 
                                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-destructive/10 text-destructive border border-destructive/20 inline-block">Full</span> : 
                                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 inline-block">Available</span>}
                                </td>
                                <td className="px-5 py-4 text-right space-x-3">
                                    <button onClick={() => { setSelectedRoom(room); setEditRoomNumber(room.room_number); setEditCapacity(room.capacity); setShowEditModal(true); }} className="text-secondary-foreground font-semibold text-sm hover:underline highlight">Edit</button>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button className="text-destructive font-semibold text-sm hover:underline">Delete</button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 rounded-[2rem] shadow-2xl sm:max-w-md">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-xl font-black">Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground">
                                                    Do you really want to delete this room? All allocations associated with it will be permanently removed.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl font-semibold border-border hover:bg-muted/50 transition-colors">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(room.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-semibold shadow-md transition-all">Confirm Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                        {rooms.length === 0 && !loading && (
                            <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No rooms found. Add one above!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="bg-card/90 backdrop-blur-2xl border-border/60 shadow-2xl rounded-[2rem] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Edit Room</DialogTitle>
                    </DialogHeader>
                    {editError && <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium text-center">{editError}</div>}
                    <form onSubmit={handleEditRoom} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Room Number</label>
                            <input type="text" required value={editRoomNumber} onChange={(e) => setEditRoomNumber(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">Capacity</label>
                            <input type="number" min="1" required value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} className="w-full bg-background border border-input rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm" />
                        </div>
                        <div className="flex space-x-3 pt-6">
                            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 border border-border bg-background rounded-xl text-foreground font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-all hover:shadow-primary/25">Save</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Rooms;
