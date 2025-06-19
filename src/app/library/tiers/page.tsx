
'use client';

import { useState, useEffect } from 'react';
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
import { TIER_DATA as FALLBACK_TIER_DATA, type TierDetail } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { TrendingUp, DollarSign, Zap, Loader2, Award } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { TierDataFromFirestore } from '@/types';

// Removed metadata export

interface TierDisplayData extends TierDetail {
  tierNumber: number;
  levelRange: string;
}

export default function LibraryTiersPage() {
  const [tiers, setTiers] = useState<TierDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tiersCollectionRef = collection(db, 'gameTiers');
    const unsubscribe = onSnapshot(tiersCollectionRef, (snapshot) => {
      const fetchedTiersFromFirestore: Record<string, TierDataFromFirestore> = {};
      snapshot.forEach(docSnap => {
        fetchedTiersFromFirestore[docSnap.id] = docSnap.data() as TierDataFromFirestore;
      });

      const combinedTierData = FALLBACK_TIER_DATA.map((constantTier, index) => {
        const tierId = `tier_${index + 1}`;
        const firestoreData = fetchedTiersFromFirestore[tierId] || {};
        return {
          ...constantTier,
          ...firestoreData,
          levelStart: constantTier.levelStart,
          tierNumber: index + 1,
        };
      });
      
      const finalTierDisplayData = combinedTierData
        .sort((a,b) => a.levelStart - b.levelStart)
        .map((tier, index, allTiers) => {
          let endLevelText;
          if (index < allTiers.length - 1) {
            endLevelText = allTiers[index + 1].levelStart - 1;
          } else {
            endLevelText = "trở lên";
          }
          let levelRange = `Cấp ${tier.levelStart}`;
          if (typeof endLevelText === 'number') {
            if (endLevelText >= tier.levelStart) { levelRange += ` - ${endLevelText}`; }
          } else { levelRange += ` ${endLevelText}`; }
          return { ...tier, levelRange };
      });

      setTiers(finalTierDisplayData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tiers from Firestore:", error);
       const constantDisplayData = FALLBACK_TIER_DATA.map((tierDetail, index) => {
          const tierNumber = index + 1;
          const startLevel = tierDetail.levelStart;
          let endLevelText;
          if (tierNumber < FALLBACK_TIER_DATA.length) {
            endLevelText = FALLBACK_TIER_DATA[tierNumber].levelStart - 1;
          } else {
            endLevelText = "trở lên";
          }
          let levelRange = `Cấp ${startLevel}`;
          if (typeof endLevelText === 'number') {
              if (endLevelText >= startLevel) { levelRange += ` - ${endLevelText}`; }
          } else { levelRange += ` ${endLevelText}`; }
          return { ...tierDetail, tierNumber, levelRange };
      });
      setTiers(constantDisplayData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-xl flex-1 flex flex-col min-h-[300px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Đang tải dữ liệu cấp bậc...</p>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl flex-1 flex flex-col min-h-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
          <Award className="h-7 w-7" /> Thông Tin Các Cấp Bậc
        </CardTitle>
        <CardDescription>
          Tổng quan về các bậc, yêu cầu cấp độ và những lợi ích đi kèm.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 pt-0">
        <Table className="relative border-separate border-spacing-0">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[80px] text-center">Bậc</TableHead>
              <TableHead className="w-[60px] text-center">Icon</TableHead>
              <TableHead>Tên Bậc</TableHead>
              <TableHead className="w-[150px]">Cấp Độ Yêu Cầu</TableHead>
              <TableHead className="w-[250px]">Lợi Ích (Buff)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => (
              <TableRow key={tier.tierNumber}>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn("text-sm px-2 py-1 font-semibold", tier.colorClass, "border-current")}>
                    {tier.tierNumber}
                  </Badge>
                </TableCell>
                <TableCell className="text-2xl text-center">{tier.icon}</TableCell>
                <TableCell className="font-medium">{tier.name}</TableCell>
                <TableCell>{tier.levelRange}</TableCell>
                <TableCell className="text-xs">
                  <div className="flex flex-col gap-1">
                    {tier.xpBoostPercent > 0 && (
                       <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <TrendingUp className="h-3 w-3 text-green-500"/> Tăng XP: +{(tier.xpBoostPercent * 100).toFixed(0)}%
                       </Badge>
                    )}
                    {tier.sellPriceBoostPercent > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <DollarSign className="h-3 w-3 text-yellow-500"/> Giá Bán: +{(tier.sellPriceBoostPercent * 100).toFixed(0)}%
                      </Badge>
                    )}
                    {tier.growthTimeReductionPercent > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Zap className="h-3 w-3 text-blue-500"/> TG Trồng: -{(tier.growthTimeReductionPercent * 100).toFixed(0)}%
                      </Badge>
                    )}
                    {tier.xpBoostPercent === 0 && tier.sellPriceBoostPercent === 0 && tier.growthTimeReductionPercent === 0 && (
                        <span className="text-muted-foreground">Không có</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
