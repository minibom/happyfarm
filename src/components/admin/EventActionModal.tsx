
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActiveGameEvent, GameEventConfig, GameEventType, GameEventEffect, InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Calendar, Tag, Percent, ListChecks, CheckSquare, XSquare, Mail } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit' | 'create';
  eventData: ActiveGameEvent;
  eventId?: string;
  onSave?: (data: ActiveGameEvent, idToSave: string, originalId?: string) => void;
  eventTemplates: GameEventConfig[];
}

const eventTypes: GameEventType[] = [
  'CROP_GROWTH_TIME_REDUCTION',
  'ITEM_PURCHASE_PRICE_MODIFIER',
  'ITEM_SELL_PRICE_MODIFIER'
];

// const affectedItemOptions: GameEventEffect['affectedItemIds'][] = [
//     'ALL_CROPS', 'ALL_SEEDS', 'ALL_FERTILIZERS'
// ];

const formatTimestampForDisplay = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) { // Check if it's a Firestore Timestamp
      return format(timestamp.toDate(), "HH:mm 'ngày' dd/MM/yyyy");
    }
    try {
      return format(new Date(timestamp), "HH:mm 'ngày' dd/MM/yyyy");
    } catch (e) {
      return 'Ngày không hợp lệ';
    }
  };

const formatEffectsForMail = (effects: GameEventEffect[]): string => {
    if (!effects || effects.length === 0) return "Không có hiệu ứng đặc biệt.";
    return effects.map(eff => {
        let target = "Tất cả";
        if (Array.isArray(eff.affectedItemIds)) target = eff.affectedItemIds.join(', ');
        else if (eff.affectedItemIds) target = eff.affectedItemIds.replace('ALL_', '').toLowerCase();

        let effectDesc = eff.type.replace(/_/g, ' ').toLowerCase();
        if (eff.type.includes('PRICE_MODIFIER')) {
            effectDesc += ` (${((eff.value - 1) * 100).toFixed(0)}%)`;
        } else { // for time reduction
            effectDesc += ` (${(eff.value * 100).toFixed(0)}%)`;
        }
        return `- ${effectDesc} cho ${target}`;
    }).join('\n');
  };

export const EventActionModal: FC<EventModalProps> = ({
    isOpen,
    onClose,
    mode,
    eventData: initialEventData,
    eventId: initialEventId,
    onSave,
    eventTemplates
}) => {
  const [formData, setFormData] = useState<ActiveGameEvent>(initialEventData);
  const [currentEventId, setCurrentEventId] = useState<string | undefined>(initialEventId);
  const router = useRouter(); // Initialize useRouter

  const [currentEffectType, setCurrentEffectType] = useState<GameEventType>(eventTypes[0]);
  const [currentEffectValue, setCurrentEffectValue] = useState<number>(0.1);
  const [currentAffectedItems, setCurrentAffectedItems] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('__clear_event_template__');


  const { toast } = useToast();

  useEffect(() => {
    setFormData(initialEventData);
    setCurrentEventId(mode === 'create' ? initialEventData.id : initialEventId);
    setSelectedTemplateId('__clear_event_template__');
  }, [initialEventData, initialEventId, mode]);

  const handleTemplateChange = (templateIdValue: string) => {
    if (templateIdValue === "__clear_event_template__") {
        setSelectedTemplateId('__clear_event_template__');
        const now = Timestamp.now();
        const oneDayLater = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);
        setFormData(prev => ({
            ...prev,
            id: mode === 'create' ? prev.id : `event_${Date.now().toString().slice(-6)}`, // Reset ID if not creating
            name: 'Sự Kiện Mới',
            description: 'Mô tả sự kiện...',
            effects: [],
            startTime: now,
            endTime: oneDayLater,
            isActive: true,
            configId: undefined,
        }));
        toast({ title: "Đã Xóa Mẫu", description: "Biểu mẫu sự kiện đã được làm mới.", variant: "default"});
    } else {
        setSelectedTemplateId(templateIdValue);
        const template = eventTemplates.find(t => t.id === templateIdValue);
        if (template && (mode === 'create' || mode === 'edit')) {
        const now = Timestamp.now();
        const durationMillis = (template.defaultDurationHours || 24) * 60 * 60 * 1000;
        const newEventId = mode === 'create' ? (formData.id || `event_${Date.now().toString().slice(-6)}`) : currentEventId;

        setFormData(prev => ({
            ...prev,
            id: newEventId || `event_tpl_${template.id}_${Date.now().toString().slice(-4)}`,
            name: template.templateName,
            description: template.description,
            effects: template.defaultEffects.map(eff => ({...eff})), // Deep copy effects
            startTime: prev.startTime || now, // Preserve existing times if editing, else use now
            endTime: prev.endTime || Timestamp.fromMillis((prev.startTime || now).toMillis() + durationMillis),
            configId: template.id,
            isActive: prev.isActive !== undefined ? prev.isActive : true,
        }));
        toast({ title: "Đã Áp Dụng Mẫu", description: `Mẫu sự kiện "${template.templateName}" đã được tải.`, className: "bg-blue-500 text-white"});
        }
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleDateChange = (field: 'startTime' | 'endTime', date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: Timestamp.fromDate(date) }));
    }
  };

  const handleEventIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value.replace(/[^a-z0-9_.-]/gi, '');
    setCurrentEventId(newId);
    if (mode === 'create') {
        setFormData(prev => ({ ...prev, id: newId }));
    }
  };

  const handleAddEffect = () => {
    if (currentEffectValue <= 0 && currentEffectType !== 'ITEM_PURCHASE_PRICE_MODIFIER' && currentEffectType !== 'ITEM_SELL_PRICE_MODIFIER') {
       toast({ title: "Lỗi", description: "Giá trị hiệu ứng phải lớn hơn 0 (trừ khi là Price Modifier).", variant: "destructive" }); return;
    }
    if ((currentEffectType === 'ITEM_PURCHASE_PRICE_MODIFIER' || currentEffectType === 'ITEM_SELL_PRICE_MODIFIER') && (currentEffectValue <=0 || currentEffectValue > 5)) {
        toast({ title: "Lỗi", description: "Giá trị Price Modifier nên từ 0.1 (giảm 90%) đến 5 (tăng 400%).", variant: "destructive" }); return;
    }

    let affected: GameEventEffect['affectedItemIds'];
    if (currentAffectedItems.startsWith('ALL_')) {
        affected = currentAffectedItems as 'ALL_CROPS' | 'ALL_SEEDS' | 'ALL_FERTILIZERS';
    } else {
        affected = currentAffectedItems.split(',').map(s => s.trim()).filter(s => s) as InventoryItem[];
        if (affected.length === 0) {
             toast({ title: "Lỗi", description: "Cần chỉ định vật phẩm bị ảnh hưởng hoặc chọn 'ALL_...'.", variant: "destructive" }); return;
        }
    }

    const newEffect: GameEventEffect = {
        type: currentEffectType,
        value: currentEffectValue,
        affectedItemIds: affected
    };
    setFormData(prev => ({ ...prev, effects: [...prev.effects, newEffect] }));
    setCurrentAffectedItems('');
    setCurrentEffectValue(0.1);
    toast({ title: "Đã Thêm Hiệu Ứng", className: "bg-green-500 text-white" });
  };

  const handleRemoveEffect = (index: number) => {
    setFormData(prev => ({ ...prev, effects: prev.effects.filter((_, i) => i !== index)}));
    toast({ title: "Đã Xóa Hiệu Ứng", variant: "default" });
  };

  const handleSubmit = () => {
    if (!currentEventId || currentEventId.trim() === '') {
      toast({ title: "Lỗi", description: "ID Sự Kiện không được để trống.", variant: "destructive" });
      return;
    }
    if (!formData.name.trim() || !formData.description.trim()) {
        toast({ title: "Lỗi", description: "Tên và Mô tả sự kiện không được để trống.", variant: "destructive" });
        return;
    }
    if (formData.effects.length === 0) {
        toast({ title: "Lỗi", description: "Sự kiện phải có ít nhất một hiệu ứng.", variant: "destructive" });
        return;
    }
    if (formData.endTime.toMillis() <= formData.startTime.toMillis()) {
        toast({ title: "Lỗi Ngày", description: "Ngày kết thúc phải sau ngày bắt đầu.", variant: "destructive" });
        return;
    }

    const finalData = {...formData, id: currentEventId };

    if (onSave) {
      onSave(finalData, currentEventId, initialEventId);
    }
    onClose();
  };
  
  const handleSendNotificationMail = () => {
    let baseSubject = "Thông Báo Sự Kiện Đặc Biệt!";
    let baseBody = "Chào các Nông Dân,\n\nMột sự kiện mới vừa được triển khai:\n\nTên sự kiện: {{eventName}}\n\nMô tả: {{eventDescription}}\n\nThời gian:\n- Bắt đầu: {{startTime}}\n- Kết thúc: {{endTime}}\n\nHiệu ứng chính:\n{{effectsSummary}}\n\nHãy tham gia và nhận những phần quà hấp dẫn nhé!";

    if (formData.configId) {
        const template = eventTemplates.find(t => t.id === formData.configId);
        if (template && template.defaultMailSubject && template.defaultMailBody) {
            baseSubject = template.defaultMailSubject;
            baseBody = template.defaultMailBody;
        }
    }

    // Replace placeholders
    let finalSubject = baseSubject.replace(/{{eventName}}/g, formData.name);
    
    let finalBody = baseBody
        .replace(/{{eventName}}/g, formData.name)
        .replace(/{{eventDescription}}/g, formData.description)
        .replace(/{{startTime}}/g, formatTimestampForDisplay(formData.startTime))
        .replace(/{{endTime}}/g, formatTimestampForDisplay(formData.endTime))
        .replace(/{{effectsSummary}}/g, formatEffectsForMail(formData.effects));

    finalBody += "\n\nTrân trọng,\nBQT Happy Farm";

    localStorage.setItem('happyFarmAdminMailDraftFromEvent', JSON.stringify({ subject: finalSubject, body: finalBody }));
    localStorage.setItem('happyFarmAdminMailDraftSource', 'event');
    router.push('/admin/mail-bonuses');
    onClose();
  };

  const titleText = mode === 'create' ? 'Tạo Sự Kiện Mới' : mode === 'edit' ? `Chỉnh Sửa: ${initialEventData.name}` : `Chi Tiết: ${initialEventData.name}`;
  const descriptionText = mode === 'create'
    ? "Điền thông tin cho sự kiện mới. Sự kiện sẽ được lưu vào 'activeGameEvents'."
    : mode === 'edit'
    ? "Chỉnh sửa thông tin sự kiện."
    : "Xem chi tiết thông tin sự kiện.";

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] my-1 pr-3">
        <div className="grid gap-6 py-4">
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="templateSelect">Dùng Mẫu Sự Kiện (Tùy chọn)</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger id="templateSelect">
                  <SelectValue placeholder="-- Chọn mẫu để bắt đầu --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__clear_event_template__">-- Không dùng mẫu / Xóa mẫu --</SelectItem>
                  {eventTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.templateName} ({template.icon})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="eventId" className="text-right">ID Sự Kiện*</Label>
            <Input
              id="eventId"
              name="id"
              value={currentEventId || ''}
              onChange={handleEventIdChange}
              placeholder="vd: weekend_harvest_boom_01"
              className="col-span-3"
              readOnly={mode === 'edit' || mode === 'view'}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Tên Sự Kiện*</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" placeholder="vd: Lễ Hội Thu Hoạch Cuối Tuần"/>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Mô tả Sự Kiện*</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} readOnly={isReadOnly} className="col-span-3" rows={3} placeholder="Mô tả ngắn gọn cho người chơi thấy..."/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="startTime">Thời Gian Bắt Đầu*</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !formData.startTime && "text-muted-foreground")}
                        disabled={isReadOnly}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.startTime ? formatTimestampForDisplay(formData.startTime) : <span>Chọn ngày giờ</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                        mode="single"
                        selected={formData.startTime instanceof Timestamp ? formData.startTime.toDate() : undefined}
                        onSelect={(date) => handleDateChange('startTime', date)}
                        initialFocus
                    />
                    <Input type="time" className="mt-1" defaultValue={formData.startTime ? format(formData.startTime.toDate(), "HH:mm") : "00:00"}
                        onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = formData.startTime ? formData.startTime.toDate() : new Date();
                            newDate.setHours(hours, minutes);
                            handleDateChange('startTime', newDate);
                        }}
                        disabled={isReadOnly}/>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="endTime">Thời Gian Kết Thúc*</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !formData.endTime && "text-muted-foreground")}
                        disabled={isReadOnly}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.endTime ? formatTimestampForDisplay(formData.endTime) : <span>Chọn ngày giờ</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                        mode="single"
                        selected={formData.endTime instanceof Timestamp ? formData.endTime.toDate() : undefined}
                        onSelect={(date) => handleDateChange('endTime', date)}
                        initialFocus
                    />
                     <Input type="time" className="mt-1" defaultValue={formData.endTime ? format(formData.endTime.toDate(), "HH:mm") : "00:00"}
                        onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = formData.endTime ? formData.endTime.toDate() : new Date();
                            newDate.setHours(hours, minutes);
                            handleDateChange('endTime', newDate);
                        }}
                        disabled={isReadOnly}/>
                    </PopoverContent>
                </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">Kích hoạt</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} disabled={isReadOnly} />
              {(mode === 'edit' || mode === 'view') && (
                  <Button onClick={handleSendNotificationMail} variant="outline" className="bg-teal-500 hover:bg-teal-600 text-white ml-auto">
                      <Mail className="mr-2 h-4 w-4" /> Gửi Mail Thông Báo
                  </Button>
              )}
            </div>
          </div>


          {!isReadOnly && (
            <div className="border-t pt-6 mt-4 space-y-4">
                <Label className="text-lg font-semibold block">Quản Lý Hiệu Ứng Sự Kiện*</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                        <Label htmlFor="effectTypeModal">Loại Hiệu Ứng</Label>
                        <Select value={currentEffectType} onValueChange={(value) => setCurrentEffectType(value as GameEventType)}>
                            <SelectTrigger id="effectTypeModal"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {eventTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase()}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="effectValueModal">Giá trị (vd: 0.1 cho 10%)</Label>
                        <Input id="effectValueModal" type="number" step="0.01" value={currentEffectValue} onChange={(e) => setCurrentEffectValue(parseFloat(e.target.value) || 0)} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="affectedItemsModal">Vật Phẩm Ảnh Hưởng</Label>
                        <Input id="affectedItemsModal" value={currentAffectedItems} onChange={(e) => setCurrentAffectedItems(e.target.value)} placeholder="ALL_CROPS hoặc item1,item2"/>
                         <p className="text-xs text-muted-foreground">Dùng 'ALL_CROPS', 'ALL_SEEDS', 'ALL_FERTILIZERS' hoặc ID cách nhau bởi dấu phẩy.</p>
                    </div>
                </div>
                <Button onClick={handleAddEffect} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4"/> Thêm Hiệu Ứng Này
                </Button>
            </div>
          )}

            {formData.effects.length > 0 && (
                <div className="mt-3 border-t pt-4 space-y-2">
                    <Label className="font-semibold block">Danh sách hiệu ứng đã thêm:</Label>
                    {formData.effects.map((effect, index) => (
                        <Card key={index} className="p-2 bg-muted/50">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex-grow space-y-0.5">
                                    <p><Tag className="inline h-3 w-3 mr-1"/><strong>Loại:</strong> {effect.type.replace(/_/g, ' ').toLowerCase()}</p>
                                    <p><Percent className="inline h-3 w-3 mr-1"/><strong>Giá trị:</strong> {(effect.type.includes('PRICE_MODIFIER') ? (effect.value * 100 -100) : (effect.value * 100)).toFixed(0)}%</p>
                                    <p><ListChecks className="inline h-3 w-3 mr-1"/><strong>Ảnh hưởng:</strong> {Array.isArray(effect.affectedItemIds) ? effect.affectedItemIds.join(', ') : effect.affectedItemIds}</p>
                                </div>
                                {!isReadOnly && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEffect(index)} className="h-7 w-7 text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
        </ScrollArea>
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          {(mode === 'create' || mode === 'edit') && (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {mode === 'create' ? 'Tạo Sự Kiện' : 'Lưu Thay Đổi'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
