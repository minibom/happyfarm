
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
import { BarChart3 } from 'lucide-react';
import { TIER_DATA, type TierDetail } from '@/lib/constants'; 
import { cn } from '@/lib/utils';

interface TierDisplayData extends TierDetail {
  tierNumber: number;
  levelRange: string;
}

export default function AdminTiersPage() {
  const tierData: TierDisplayData[] = TIER_DATA.map((tierDetail, index) => {
    const tierNumber = index + 1;
    const startLevel = tierDetail.levelStart;
    let endLevelText;
    if (tierNumber < TIER_DATA.length) {
      // Calculate the end level for the current tier based on the start of the next tier
      endLevelText = TIER_DATA[tierNumber].levelStart - 1;
    } else {
      // For the last tier
      endLevelText = "trở lên";
    }
    
    let levelRange = `Cấp ${startLevel}`;
    if (typeof endLevelText === 'number') {
        if (endLevelText >= startLevel) { // Ensure end level is not less than start level
             levelRange += ` - ${endLevelText}`;
        }
    } else {
        levelRange += ` ${endLevelText}`;
    }


    return {
      ...tierDetail,
      tierNumber,
      levelRange,
    };
  });

  return (
    <Card className="shadow-xl flex-1 flex flex-col min-h-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
              <BarChart3 className="h-7 w-7" /> Quản Lý Bậc ({tierData.length})
            </CardTitle>
            <CardDescription>
              Xem lại cấu hình các bậc (tier) hiện tại trong trò chơi.
              Dữ liệu này được lấy từ <code>src/lib/constants.ts</code>.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6 pt-0">
        <Table className="relative border-separate border-spacing-0">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[120px] text-center">Bậc Số</TableHead>
              <TableHead className="w-[80px] text-center">Biểu Tượng</TableHead>
              <TableHead>Tên Bậc</TableHead>
              <TableHead className="w-[200px]">Phạm Vi Cấp Độ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tierData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Không có dữ liệu bậc nào được cấu hình.
                </TableCell>
              </TableRow>
            ) : (
              tierData.map((tier) => (
                <TableRow key={tier.tierNumber}>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn("text-sm px-3 py-1 font-semibold border-current", tier.colorClass)}>
                      Bậc {tier.tierNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-2xl text-center">{tier.icon}</TableCell>
                  <TableCell className="font-medium">{tier.name}</TableCell>
                  <TableCell>{tier.levelRange}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

