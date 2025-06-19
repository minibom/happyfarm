
'use client';

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActiveGameEvent } from '@/types';
import { CalendarDays, Info, PartyPopper, Sparkles, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvents: ActiveGameEvent[];
  aiGreeting: string | null;
  isLoadingGreeting: boolean;
}

const WelcomePopup: FC<WelcomePopupProps> = ({
  isOpen,
  onClose,
  activeEvents,
  aiGreeting,
  isLoadingGreeting,
}) => {
  const hasActiveEvents = activeEvents && activeEvents.length > 0;

  const formatTimestampForDisplay = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    // Assuming timestamp is already a number (milliseconds) as handled in useMarket and useGameStateCore
    if (typeof timestamp === 'number') {
        try {
            return format(new Date(timestamp), "HH:mm 'ngày' dd/MM/yyyy");
        } catch (e) {
            return 'Ngày không hợp lệ';
        }
    }
    // Fallback for direct Firestore Timestamp object (should ideally not happen in this component)
    if (timestamp.toDate) { 
      return format(timestamp.toDate(), "HH:mm 'ngày' dd/MM/yyyy");
    }
    return 'Ngày không hợp lệ';
  };

  const getEffectSummary = (effects: ActiveGameEvent['effects']) => {
    if (!effects || effects.length === 0) return "Không có hiệu ứng đặc biệt.";
    const summary = effects.map(eff => {
        let target = "Tất cả";
        if (Array.isArray(eff.affectedItemIds)) target = eff.affectedItemIds.slice(0,2).join(', ') + (eff.affectedItemIds.length > 2 ? '...' : '');
        else if (eff.affectedItemIds) target = eff.affectedItemIds.replace('ALL_', '').toLowerCase();

        let effectDesc = eff.type.replace(/_/g, ' ').toLowerCase();
         if (eff.type.includes('PRICE_MODIFIER')) {
            effectDesc += ` (${((eff.value - 1) * 100).toFixed(0)}%)`;
        } else { // for time reduction
            effectDesc += ` (${(eff.value * 100).toFixed(0)}%)`;
        }
        return `- ${effectDesc} cho ${target}`;
    }).join('\n');
    return summary;
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            {hasActiveEvents ? (
              <PartyPopper className="w-7 h-7 text-primary" />
            ) : (
              <Sparkles className="w-7 h-7 text-yellow-500" />
            )}
            {hasActiveEvents ? 'Sự Kiện Đang Diễn Ra!' : 'Chào Mừng Trở Lại!'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] my-4 pr-2">
          {hasActiveEvents ? (
            <div className="space-y-4">
              {activeEvents.map(event => (
                <div key={event.id} className="p-3 border rounded-lg bg-card shadow">
                  <h3 className="font-semibold text-lg text-accent mb-1">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  <div className="text-xs space-y-1">
                    <p className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <span>{getEffectSummary(event.effects)}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-muted-foreground" />
                      <span>Kết thúc: {formatTimestampForDisplay(event.endTime)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : isLoadingGreeting ? (
            <p className="text-center text-muted-foreground py-4">Đang chuẩn bị lời chào...</p>
          ) : aiGreeting ? (
            <div className="text-center py-4">
              <Image 
                src="https://placehold.co/120x120.png" 
                alt="Happy Farm Mascot"
                width={100}
                height={100}
                className="mx-auto rounded-full mb-4 shadow-lg border-primary border-2"
                data-ai-hint="friendly farmer mascot"
              />
              <p className="text-lg text-foreground">{aiGreeting}</p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Không có sự kiện nào đang diễn ra.</p>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            Ok, Vào Game!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;

