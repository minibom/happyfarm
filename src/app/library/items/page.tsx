
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  CROP_DATA as FALLBACK_CROP_DATA, 
  FERTILIZER_DATA as FALLBACK_FERTILIZER_DATA, 
  TIER_DATA,
  type CropDetails, type CropId,
  type FertilizerDetails, type FertilizerId
} from '@/lib/constants';
import { Coins, Clock, TrendingUp, ShoppingBag, Sprout, Zap as FertilizerIcon, Package, Info, Loader2, Zap } from 'lucide-react'; // Added Zap here
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const formatMillisecondsToTime = (ms: number): string => {
  if (isNaN(ms) || ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const CropsInfoTab = () => {
  const [crops, setCrops] = useState<Array<CropDetails & { id: CropId }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cropsCollectionRef = collection(db, 'gameItems');
    const q = query(cropsCollectionRef, orderBy("unlockTier"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCrops: Array<CropDetails & { id: CropId }> = [];
      snapshot.forEach(docSnap => {
        fetchedCrops.push({ id: docSnap.id as CropId, ...(docSnap.data() as CropDetails) });
      });
      if (fetchedCrops.length === 0) {
        console.warn("No crops found in Firestore, using fallback for Library.");
        setCrops(Object.entries(FALLBACK_CROP_DATA).map(([id, details]) => ({ id: id as CropId, ...details })));
      } else {
        setCrops(fetchedCrops);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching crops for library:", error);
      setCrops(Object.entries(FALLBACK_CROP_DATA).map(([id, details]) => ({ id: id as CropId, ...details })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-[300px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-md text-muted-foreground">Đang tải dữ liệu cây trồng...</p>
      </div>
    );
  }
  
  const sortedCrops = [...crops].sort((a, b) => {
      if (a.unlockTier !== b.unlockTier) return a.unlockTier - b.unlockTier;
      return a.name.localeCompare(b.name);
  });


  return (
    <ScrollArea className="h-[calc(100vh-350px)]">
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
  );
};

const FertilizersInfoTab = () => {
  const [fertilizers, setFertilizers] = useState<FertilizerDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fertilizersCollectionRef = collection(db, 'gameFertilizers');
     const q = query(fertilizersCollectionRef, orderBy("unlockTier"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedFertilizers: FertilizerDetails[] = [];
      snapshot.forEach(docSnap => {
        fetchedFertilizers.push(docSnap.data() as FertilizerDetails);
      });
      if (fetchedFertilizers.length === 0) {
        console.warn("No fertilizers found in Firestore, using fallback for Library.");
        setFertilizers(Object.values(FALLBACK_FERTILIZER_DATA));
      } else {
        setFertilizers(fetchedFertilizers);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching fertilizers for library:", error);
      setFertilizers(Object.values(FALLBACK_FERTILIZER_DATA));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-[300px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-md text-muted-foreground">Đang tải dữ liệu phân bón...</p>
      </div>
    );
  }
  
  const sortedFertilizers = [...fertilizers].sort((a, b) => {
      if (a.unlockTier !== b.unlockTier) return a.unlockTier - b.unlockTier;
      return a.name.localeCompare(b.name);
  });

  return (
    <ScrollArea className="h-[calc(100vh-350px)]">
      <Table className="relative border-separate border-spacing-0">
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[50px]">Icon</TableHead>
            <TableHead>Tên Phân Bón</TableHead>
            <TableHead className="w-[100px] text-center">Bậc Mở</TableHead>
            <TableHead>Mô Tả</TableHead>
            <TableHead className="w-[100px] text-center"><Coins className="inline mr-1 h-4 w-4"/>Giá</TableHead>
            <TableHead className="w-[120px] text-center"><Zap className="inline mr-1 h-4 w-4"/>Giảm TG (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFertilizers.map((fert) => {
             const tierInfo = fert.unlockTier > 0 && fert.unlockTier <= TIER_DATA.length 
                            ? TIER_DATA[fert.unlockTier - 1] 
                            : null;
            return (
              <TableRow key={fert.id}>
                <TableCell className="text-2xl text-center">{fert.icon}</TableCell>
                <TableCell className="font-medium">{fert.name}</TableCell>
                <TableCell className="text-center">
                  {tierInfo ? (
                    <Badge variant="outline" className={cn("text-xs border-current", tierInfo.colorClass)}>
                      {tierInfo.icon} Bậc {fert.unlockTier}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="border-current">Bậc {fert.unlockTier}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs truncate max-w-xs" title={fert.description}>{fert.description}</TableCell>
                <TableCell className="text-center text-primary font-semibold">{fert.price.toLocaleString()}</TableCell>
                <TableCell className="text-center text-blue-600 font-semibold">{(fert.timeReductionPercent * 100).toFixed(0)}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default function LibraryItemsPage() {
  return (
    <Card className="shadow-xl flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
            <Package className="h-7 w-7"/> Thông Tin Vật Phẩm
        </CardTitle>
        <CardDescription>
          Chi tiết về các loại cây trồng và phân bón có trong Happy Farm.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-6 pt-0">
        <Tabs defaultValue="crops" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
            <TabsTrigger value="crops" className="py-2.5 text-base">
              <Sprout className="mr-2 h-5 w-5" /> Cây Trồng
            </TabsTrigger>
            <TabsTrigger value="fertilizers" className="py-2.5 text-base">
              <FertilizerIcon className="mr-2 h-5 w-5" /> Phân Bón
            </TabsTrigger>
          </TabsList>
          <TabsContent value="crops" className="flex-1 min-h-0">
            <CropsInfoTab />
          </TabsContent>
          <TabsContent value="fertilizers" className="flex-1 min-h-0">
            <FertilizersInfoTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
    
