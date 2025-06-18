
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Info, CalendarDays, Tag, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { MarketEventData, MarketItemId } from '@/types';
import { useMarket } from '@/hooks/useMarket'; // To get item details
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function LibraryEventsPage() {
  const [marketEvent, setMarketEvent] = useState<MarketEventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getItemDetails } = useMarket(); // Use hook to resolve item names and icons

  useEffect(() => {
    const marketDocRef = doc(db, 'marketState', 'global');
    const unsubscribe = onSnapshot(marketDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMarketEvent(data.currentEvent || null);
      } else {
        setMarketEvent(null);
      }
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching market event:", err);
      setError("Không thể tải thông tin sự kiện. Vui lòng thử lại sau.");
      setIsLoading(false);
      setMarketEvent(null);
    });

    return () => unsubscribe();
  }, []);

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
  
  const getAffectedItemInfo = () => {
      if (!marketEvent || !marketEvent.itemId) return null;
      const details = getItemDetails(marketEvent.itemId);
      if (!details) return { name: marketEvent.itemId, icon: '❓', type: 'Không rõ' };
      return { name: details.name, icon: details.icon, type: details.type === 'seed' ? 'Hạt Giống' : 'Nông Sản' };
  }

  const affectedItemInfo = getAffectedItemInfo();

  return (
    <Card className="shadow-xl flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
          <Zap className="h-7 w-7" /> Sự Kiện Đang Diễn Ra
        </CardTitle>
        <CardDescription>
          Thông tin về các sự kiện đặc biệt đang ảnh hưởng đến thị trường trong game.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!marketEvent || !marketEvent.isActive ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-10">
            <Image 
                src="https://placehold.co/300x200.png" 
                alt="Không có sự kiện" 
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
          <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/30 shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl text-primary mb-1">{marketEvent.eventName}</CardTitle>
                        <CardDescription className="text-sm">{marketEvent.description}</CardDescription>
                    </div>
                    <div className={cn(
                        "p-2 rounded-md text-white text-xs font-semibold shadow",
                        marketEvent.priceModifier && marketEvent.priceModifier > 1 ? "bg-green-500" :
                        marketEvent.priceModifier && marketEvent.priceModifier < 1 ? "bg-red-500" : "bg-blue-500"
                    )}>
                        {marketEvent.priceModifier && marketEvent.priceModifier > 1 ? <TrendingUp className="inline mr-1 h-4 w-4"/> :
                         marketEvent.priceModifier && marketEvent.priceModifier < 1 ? <TrendingDown className="inline mr-1 h-4 w-4"/> :
                         <Gift className="inline mr-1 h-4 w-4"/>}
                        {marketEvent.effectDescription || "Ưu Đãi Đặc Biệt"}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {affectedItemInfo && (
                <div className="flex items-center gap-2 p-3 bg-background/70 rounded-md border">
                    <span className="text-2xl">{affectedItemInfo.icon}</span>
                    <div>
                        <p className="font-semibold">Vật phẩm ảnh hưởng:</p>
                        <p>{affectedItemInfo.name} <Badge variant="outline" className="ml-1 text-xs">{affectedItemInfo.type}</Badge></p>
                    </div>
                </div>
              )}
              {marketEvent.priceModifier && (
                <p>
                  <span className="font-semibold">Thay đổi giá: </span> 
                  {(marketEvent.priceModifier * 100 - 100).toFixed(0)}%
                  (Giá mới = Giá gốc x {marketEvent.priceModifier.toFixed(2)})
                </p>
              )}
              {marketEvent.expiresAt && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <span className="font-semibold">Kết thúc vào: </span> 
                    {new Date(marketEvent.expiresAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
               {marketEvent.durationHours && !marketEvent.expiresAt && ( // Fallback if only durationHours is present
                 <div className="flex items-center gap-2">
                   <CalendarDays className="w-4 h-4 text-muted-foreground" />
                   <span><span className="font-semibold">Thời gian: </span> {marketEvent.durationHours} giờ</span>
                 </div>
               )}
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground italic">Thông tin sự kiện được cập nhật tự động.</p>
             </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
    