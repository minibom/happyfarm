
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Timestamp, collection, addDoc, serverTimestamp, getDocs, query, orderBy, where, writeBatch, doc, setDoc, deleteDoc, getDoc, updateDoc, onSnapshot, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { ActiveGameEvent, GameEventConfig } from '@/types';
import { Eye, Edit, Trash2, Loader2, PlusCircle, CalendarDays, Zap, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EventActionModal } from '@/components/admin/EventActionModal'; // To be created
import { GAME_EVENT_TEMPLATES_DATA } from '@/lib/constants'; // For creating events based on templates

export default function AdminEventsPage() {
  const [activeEvents, setActiveEvents] = useState<ActiveGameEvent[]>([]);
  const [eventTemplates, setEventTemplates] = useState<GameEventConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<React.ComponentProps<typeof EventActionModal>, 'isOpen' | 'onClose' | 'eventTemplates'>>({
    mode: 'view',
    eventData: { id: '', name: '', description: '', effects: [], startTime: Timestamp.now(), endTime: Timestamp.now(), isActive: true },
  });
  const { toast } = useToast();

  useEffect(() => {
    // Fetch active/scheduled events
    const eventsCollectionRef = collection(db, 'activeGameEvents');
    const q = query(eventsCollectionRef, orderBy("startTime", "desc"));

    const unsubscribeEvents = onSnapshot(q, (snapshot) => {
      const fetchedEvents: ActiveGameEvent[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as Omit<ActiveGameEvent, 'id'>;
        fetchedEvents.push({ 
          id: docSnap.id, 
          ...data,
          startTime: data.startTime, // Keep as Firestore Timestamp for now
          endTime: data.endTime,
        });
      });
      setActiveEvents(fetchedEvents);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching active game events:", error);
      toast({ title: "Lỗi Tải Sự Kiện", description: "Không thể tải danh sách sự kiện đang hoạt động.", variant: "destructive" });
      setIsLoading(false);
    });

    // Fetch event templates (definitions)
    const templatesCollectionRef = collection(db, 'gameEventTemplates');
    const unsubscribeTemplates = onSnapshot(templatesCollectionRef, (snapshot) => {
        const templates: GameEventConfig[] = [];
        snapshot.forEach(docSnap => {
            templates.push(docSnap.data() as GameEventConfig);
        });
        setEventTemplates(templates);
    }, (error) => {
        console.error("Error fetching event templates:", error);
        // Fallback or use local constants if Firestore fetch fails
        setEventTemplates(GAME_EVENT_TEMPLATES_DATA); 
    });


    return () => {
      unsubscribeEvents();
      unsubscribeTemplates();
    };
  }, [toast]);

  const openModal = (mode: 'view' | 'edit' | 'create', event?: ActiveGameEvent) => {
    if (mode === 'create') {
      const now = Timestamp.now();
      const oneDayLater = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);
      setModalProps({
        mode: 'create',
        eventData: { 
          id: `event_${Date.now().toString().slice(-6)}`, // Temporary client-side ID for creation
          name: 'Sự Kiện Mới', 
          description: 'Mô tả sự kiện...', 
          effects: [], 
          startTime: now, 
          endTime: oneDayLater, 
          isActive: true 
        },
      });
    } else if (event) {
      setModalProps({ mode, eventData: event, eventId: event.id });
    }
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (data: ActiveGameEvent, idToSave: string, originalId?: string) => {
    try {
      const eventRef = doc(db, 'activeGameEvents', idToSave);
      // Ensure timestamps are correctly formatted for Firestore
      const dataToSave = {
        ...data,
        startTime: data.startTime instanceof Timestamp ? data.startTime : Timestamp.fromDate(new Date(data.startTime)),
        endTime: data.endTime instanceof Timestamp ? data.endTime : Timestamp.fromDate(new Date(data.endTime)),
        id: idToSave, // Ensure ID is part of the document data if needed by queries/rules
      };
      
      // If mode is 'edit' and ID changed (though not typical for Firestore IDs), handle deletion of old doc if necessary
      if (modalProps.mode === 'edit' && originalId && originalId !== idToSave) {
         // This scenario is unlikely if using Firestore auto-generated IDs or fixed IDs upon creation.
         // For simplicity, we assume ID does not change post-creation if it's the doc ID.
         // If 'id' is a field within the doc and changeable, then this logic might be needed.
        const oldDocRef = doc(db, 'activeGameEvents', originalId);
        await deleteDoc(oldDocRef);
      }

      await setDoc(eventRef, dataToSave, { merge: modalProps.mode === 'edit' });
      toast({
        title: `Thành Công (${modalProps.mode === 'create' ? 'Tạo Mới' : 'Chỉnh Sửa'})`,
        description: `Đã ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} sự kiện "${data.name}".`,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error(`Error ${modalProps.mode === 'create' ? 'creating' : 'updating'} event:`, error);
      toast({ title: "Lỗi Lưu Trữ", description: `Không thể ${modalProps.mode === 'create' ? 'tạo' : 'cập nhật'} sự kiện. Lỗi: ${(error as Error).message}`, variant: "destructive" });
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = async (eventToDelete: ActiveGameEvent) => {
    try {
      await deleteDoc(doc(db, 'activeGameEvents', eventToDelete.id));
      toast({
        title: "Đã Xóa",
        description: `Đã xóa sự kiện "${eventToDelete.name}".`,
        className: "bg-orange-500 text-white"
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ title: "Lỗi Xóa", description: `Không thể xóa sự kiện "${eventToDelete.name}".`, variant: "destructive" });
    }
  };

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) { // Check if it's a Firestore Timestamp
      return timestamp.toDate().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    // Fallback for numbers or string dates (less ideal)
    try {
      return new Date(timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Ngày không hợp lệ';
    }
  };

  const getEffectSummary = (effects: ActiveGameEvent['effects']) => {
    if (!effects || effects.length === 0) return "Không có hiệu ứng";
    const summary = effects.map(eff => {
        let target = "Tất cả";
        if (Array.isArray(eff.affectedItemIds)) target = eff.affectedItemIds.slice(0,2).join(', ') + (eff.affectedItemIds.length > 2 ? '...' : '');
        else if (eff.affectedItemIds) target = eff.affectedItemIds.replace('ALL_', '').toLowerCase();

        return `${eff.type.replace(/_/g, ' ').toLowerCase()} (${(eff.value * 100).toFixed(0)}% trên ${target})`;
    }).join('; ');
    return summary.length > 60 ? summary.substring(0, 57) + "..." : summary;
  };

  return (
    <Card className="shadow-xl flex flex-col flex-1 min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
          <CalendarDays className="h-7 w-7" /> Quản Lý Sự Kiện Game
        </CardTitle>
        <CardDescription>
          Tạo, chỉnh sửa và quản lý các sự kiện đang diễn ra hoặc được lên lịch trong game.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-6">
        <div className="flex justify-end mb-4 shrink-0">
          <Button onClick={() => openModal('create')} className="bg-accent hover:bg-accent/90">
            <PlusCircle className="mr-2 h-5 w-5" /> Tạo Sự Kiện Mới
          </Button>
        </div>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-xl">Đang tải danh sách sự kiện...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <Table className="relative border-separate border-spacing-0">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[100px] text-center">Trạng Thái</TableHead>
                  <TableHead>Tên Sự Kiện (ID)</TableHead>
                  <TableHead className="w-[150px]">Bắt Đầu</TableHead>
                  <TableHead className="w-[150px]">Kết Thúc</TableHead>
                  <TableHead>Hiệu Ứng Chính</TableHead>
                  <TableHead className="text-center w-[120px]">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Không có sự kiện nào được cấu hình.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-center">
                        <Badge variant={event.isActive ? 'default' : 'outline'} className={cn(event.isActive ? 'bg-green-500 hover:bg-green-600' : 'text-muted-foreground')}>
                          {event.isActive ? 'Hoạt Động' : 'Không K.Hoạt'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{event.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">{event.id}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatTimestamp(event.startTime)}</TableCell>
                      <TableCell className="text-xs">{formatTimestamp(event.endTime)}</TableCell>
                      <TableCell className="text-xs truncate max-w-xs" title={getEffectSummary(event.effects)}>
                        {getEffectSummary(event.effects)}
                      </TableCell>
                      <TableCell className="text-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openModal('view', event)} className="hover:text-primary" title="Xem">
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openModal('edit', event)} className="hover:text-blue-600" title="Sửa">
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event)} className="hover:text-destructive" title="Xóa">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {isModalOpen && (
        <EventActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveChanges}
          eventTemplates={eventTemplates} // Pass fetched templates
          {...modalProps}
        />
      )}
    </Card>
  );
}
