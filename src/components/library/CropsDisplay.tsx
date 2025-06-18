
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CROP_DATA, type CropDetails, type CropId, TIER_DATA } from '@/lib/constants';
import { Coins, Clock, TrendingUp, ShoppingBag, Sprout } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameLogic } from '@/hooks/useGameLogic'; // To potentially get live crop data
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn

const formatMillisecondsToTime = (ms: number): string => {
  if (isNaN(ms) || ms <= 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
};

export default function CropsDisplay() {
  const { cropData: liveCropData, isInitialized } = useGameLogic();

  const cropDataToDisplay = liveCropData || CROP_DATA; 

  const sortedCrops = Object.entries(cropDataToDisplay)
    .map(([id, details]) => ({ id: id as CropId, ...details }))
    .sort((a, b) => {
      if (a.unlockTier !== b.unlockTier) {
        return a.unlockTier - b.unlockTier;
      }
      return a.name.localeCompare(b.name);
    });

  if (!isInitialized && !liveCropData) {
     return (
      <Card className="shadow-xl flex-1 flex flex-col min-h-[300px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Đang tải dữ liệu cây trồng...</p>
      </Card>
    );
  }


  return (
    <Card className="shadow-xl flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline">
          Thông Tin Các Loại Cây Trồng
        </CardTitle>
        <CardDescription>
          Chi tiết về các loại cây, thời gian trồng, giá cả và yêu cầu bậc.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 pt-0">
        <ScrollArea className="h-[calc(100vh-250px)]"> 
          <Table className="relative border-separate border-spacing-0">
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[50px]">Icon</TableHead>
                <TableHead>Tên Cây</TableHead>
                <TableHead className="w-[100px] text-center">Bậc Mở</TableHead>
                <TableHead className="w-[120px]"><Clock className="inline mr-1 h-4 w-4"/>TG Lớn</TableHead>
                <TableHead className="w-[120px]"><Clock className="inline mr-1 h-4 w-4"/>TG Sẵn</TableHead>
                <TableHead className="w-[80px] text-center"><ShoppingBag className="inline mr-1 h-4 w-4"/>S.Lượng</TableHead>
                <TableHead className="w-[100px]"><Coins className="inline mr-1 h-4 w-4"/>Giá Hạt</TableHead>
                <TableHead className="w-[100px]"><Coins className="inline mr-1 h-4 w-4"/>Giá Bán</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCrops.map((crop) => {
                const tierInfo = crop.unlockTier > 0 && crop.unlockTier <= TIER_DATA.length 
                                ? TIER_DATA[crop.unlockTier - 1] 
                                : null;
                return (
                  <TableRow key={crop.id}>
                    <TableCell className="text-2xl text-center">{crop.icon}</TableCell>
                    <TableCell className="font-medium">{crop.name}</TableCell>
                    <TableCell className="text-center">
                      {tierInfo ? (
                        <Badge variant="outline" className={cn("text-xs border-current", tierInfo.colorClass)}>
                          {tierInfo.icon} Bậc {crop.unlockTier}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="border-current">Bậc {crop.unlockTier}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatMillisecondsToTime(crop.timeToGrowing)}</TableCell>
                    <TableCell>{formatMillisecondsToTime(crop.timeToReady)}</TableCell>
                    <TableCell className="text-center">{crop.harvestYield}</TableCell>
                    <TableCell className="text-primary font-semibold">{crop.seedPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-accent font-semibold">{crop.cropPrice.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
