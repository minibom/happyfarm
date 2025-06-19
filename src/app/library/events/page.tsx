
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Info, CalendarDays, Tag, TrendingUp, TrendingDown, Gift, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { ActiveGameEvent, MarketItemId, InventoryItem } from '@/types';
import { useMarket } from '@/hooks/useMarket';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import Image from 'next/image';


export default function LibraryEventsPage() {
  const [activeEvents, setActiveEvents] = useState<ActiveGameEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getItemDetails } = useMarket(); // Using market hook to get consistent item details

  useEffect(() => {
    const now = Timestamp.now();
    const eventsCollectionRef = collection(db, 'activeGameEvents');
    const q = query(
      eventsCollectionRef,
      where('isActive', '==', true),
      where('startTime', '<=', now)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: ActiveGameEvent[] = [];
      snapshot.forEach(docSnap => {
        const eventDocData = docSnap.data() as Omit<ActiveGameEvent, 'id'>;
        
        // Ensure startTime and endTime are numbers (milliseconds)
        const startTimeMillis = eventDocData.startTime && typeof eventDocData.startTime === 'object' && 'toMillis' in eventDocData.startTime
          ? (eventDocData.startTime as unknown as Timestamp).toMillis()
          : typeof eventDocData.startTime === 'number' ? eventDocData.startTime : Date.now();
        
        const endTimeMillis = eventDocData.endTime && typeof eventDocData.endTime === 'object' && 'toMillis' in eventDocData.endTime
          ? (eventDocData.endTime as unknown as Timestamp).toMillis()
          : typeof eventDocData.endTime === 'number' ? eventDocData.endTime : Date.now() + 24 * 60 * 60 * 1000;

        if (endTimeMillis > now.toMillis()) {
          fetchedEvents.push({ 
            id: docSnap.id, 
            ...eventDocData,
            startTime: startTimeMillis,
            endTime: endTimeMillis,
          });
        }
      });
      setActiveEvents(fetchedEvents.sort((a,b) => (a.startTime as number) - (b.startTime as number)));
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching active game events for library:", err);
      setError("Không thể tải thông tin sự kiện. Vui lòng thử lại sau.");
      setIsLoading(false);
      setActiveEvents([]);
    });

    return () => unsubscribe();
  }, []);

  const getAffectedItemInfoDisplay = (itemId?: MarketItemId | 'ALL_CROPS' | 'ALL_SEEDS' | 'ALL_FERTILIZERS' | InventoryItem[]) => {
    if (!itemId) return null;
    if (typeof itemId === 'string' && itemId.startsWith('ALL_')) {
        return { name: itemId.replace('ALL_', 'Tất Cả ').toLowerCase(), icon: '🏷️', type: 'Danh Mục' };
    }
    if (Array.isArray(itemId)) {
        const firstItemDetails = itemId.length > 0 ? getItemDetails(itemId[0] as MarketItemId) : null;
        const name = firstItemDetails ? `${firstItemDetails.name}${itemId.length > 1 ? ` và ${itemId.length -1} khác` : ''}` : 'Nhiều Vật Phẩm';
        return { name, icon: firstItemDetails?.icon || '📦', type: 'Nhiều Loại'};
    }
    const details = getItemDetails(itemId as MarketItemId);
    if (!details) return { name: itemId, icon: '❓', type: 'Không rõ' };
    return { name: details.name, icon: details.icon, type: details.type === 'seed' ? 'Hạt Giống' : details.type === 'fertilizer' ? 'Phân Bón' : 'Nông Sản' };
  };
  
  const getEffectDisplayInfo = (event: ActiveGameEvent) => {
    if (!event.effects || event.effects.length === 0) return { text: "Không có hiệu ứng cụ thể", icon: <Info className="inline mr-1 h-4 w-4"/>, color: "bg-blue-500" };
    
    const firstEffect = event.effects[0];
    let text = event.name; 
    let icon = <Zap className="inline mr-1 h-4 w-4"/>;
    let color = "bg-blue-500";

    if (firstEffect.type === 'ITEM_SELL_PRICE_MODIFIER' || firstEffect.type === 'ITEM_PURCHASE_PRICE_MODIFIER') {
        if (firstEffect.value > 1) {
            text = `${firstEffect.type === 'ITEM_SELL_PRICE_MODIFIER' ? 'Giá bán tăng' : 'Giá mua tăng'} ${((firstEffect.value - 1) * 100).toFixed(0)}%`;
            icon = <TrendingUp className="inline mr-1 h-4 w-4"/>;
            color = "bg-green-500";
        } else if (firstEffect.value < 1) {
            text = `${firstEffect.type === 'ITEM_SELL_PRICE_MODIFIER' ? 'Giá bán giảm' : 'Giá mua giảm'} ${((1 - firstEffect.value) * 100).toFixed(0)}%`;
            icon = <TrendingDown className="inline mr-1 h-4 w-4"/>;
            color = "bg-red-500";
        }
    } else if (firstEffect.type === 'CROP_GROWTH_TIME_REDUCTION') {
        text = `TG trồng giảm ${(firstEffect.value * 100).toFixed(0)}%`;
        icon = <Zap className="inline mr-1 h-4 w-4"/>;
        color = "bg-sky-500";
    }
    return { text, icon, color };
  }


  if (isLoading) {
    return (
      <Card className="shadow-xl flex-1 flex flex-col min-h-[300px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Đang tải thông tin sự kiện...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Lỗi Tải Dữ Liệu</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-xl flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
          <Zap className="h-7 w-7" /> Sự Kiện Đang Diễn Ra
        </CardTitle>
        <CardDescription>
          Thông tin về các sự kiện đặc biệt đang ảnh hưởng đến thị trường và nông trại trong game.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {activeEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-10">
            <Image 
                src="https://placehold.co/300x200.png" 
                alt="Lịch trống, không có sự kiện" 
                width={300} 
                height={200} 
                className="rounded-lg mb-6 opacity-70"
                data-ai-hint="empty calendar"
            />
            <Info className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">Hiện tại không có sự kiện nào diễn ra.</p>
            <p className="text-sm text-muted-foreground mt-1">Hãy kiểm tra lại sau để không bỏ lỡ nhé!</p>
          </div>
        ) : (
          activeEvents.map(event => {
            const affectedItemInfo = event.effects.length > 0 ? getAffectedItemInfoDisplay(event.effects[0].affectedItemIds) : null;
            const displayEffect = getEffectDisplayInfo(event);
            return (
              <Card key={event.id} className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/30 shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl text-primary mb-1">{event.name}</CardTitle>
                            <CardDescription className="text-sm">{event.description}</CardDescription>
                        </div>
                         <div className={cn(
                            "p-2 rounded-md text-white text-xs font-semibold shadow",
                            displayEffect.color
                        )}>
                            {displayEffect.icon}
                            {displayEffect.text}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {affectedItemInfo && (
                    <div className="flex items-center gap-2 p-3 bg-background/70 rounded-md border">
                        <span className="text-2xl">{affectedItemInfo.icon}</span>
                        <div>
                            <p className="font-semibold">Đối tượng ảnh hưởng:</p>
                            <p>{affectedItemInfo.name} <Badge variant="outline" className="ml-1 text-xs">{affectedItemInfo.type}</Badge></p>
                        </div>
                    </div>
                  )}
                  {event.endTime && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      <span>
                        <span className="font-semibold">Kết thúc vào: </span> 
                        {new Date(event.endTime as number).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground italic">Thông tin sự kiện được cập nhật tự động.</p>
                 </CardFooter>
              </Card>
            )
          })
        )}
      </CardContent>
    </Card>
  );
}

