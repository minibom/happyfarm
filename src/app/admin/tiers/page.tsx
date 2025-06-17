
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
import { TIER_NAMES } from '@/lib/constants';

interface TierDisplayData {
  tierNumber: number;
  tierName: string;
  levelRange: string;
}

export default function AdminTiersPage() {
  const tierData: TierDisplayData[] = TIER_NAMES.map((name, index) => {
    const tierNumber = index + 1;
    const startLevel = (tierNumber - 1) * 10 + 1;
    const endLevel = tierNumber * 10;
    let levelRange = `Cấp ${startLevel} - ${endLevel}`;
    if (tierNumber === TIER_NAMES.length) {
      levelRange = `Cấp ${startLevel} trở lên`;
    }
    return {
      tierNumber,
      tierName: name,
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
              <TableHead className="w-[100px] text-center">Bậc Số</TableHead>
              <TableHead>Tên Bậc</TableHead>
              <TableHead className="w-[200px]">Phạm Vi Cấp Độ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tierData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Không có dữ liệu bậc nào được cấu hình.
                </TableCell>
              </TableRow>
            ) : (
              tierData.map((tier) => (
                <TableRow key={tier.tierNumber}>
                  <TableCell className="text-center">
                    <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-1">
                      Bậc {tier.tierNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{tier.tierName}</TableCell>
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
