
'use client';

import { CROP_DATA, ALL_CROP_IDS } from '@/lib/constants';
import type { CropId } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function AdminItemsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary font-headline">
            Admin - Crop Item Configuration
          </CardTitle>
          <CardDescription>
            This page displays the current configuration for crop items in the game.
            These values are defined in <code>src/lib/constants.ts</code>.
            <br />
            <strong>To modify these values, please describe the changes you want to the AI assistant.</strong>
            <br />
            For a production application, this data would ideally be managed in a database (e.g., Firestore)
            with a proper admin interface to edit and save changes directly. This page is currently read-only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name (ID)</TableHead>
                  <TableHead>Seed Name</TableHead>
                  <TableHead>Grow Time (ms)</TableHead>
                  <TableHead>Ready Time (ms)</TableHead>
                  <TableHead>Yield</TableHead>
                  <TableHead>Seed Price</TableHead>
                  <TableHead>Crop Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_CROP_IDS.map((cropId: CropId) => {
                  const item = CROP_DATA[cropId];
                  return (
                    <TableRow key={cropId}>
                      <TableCell className="text-2xl">{item.icon}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <Badge variant="outline" className="text-xs">{cropId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{item.seedName}</Badge>
                      </TableCell>
                      <TableCell>{item.timeToGrowing.toLocaleString()}</TableCell>
                      <TableCell>{item.timeToReady.toLocaleString()}</TableCell>
                      <TableCell>{item.harvestYield}</TableCell>
                      <TableCell className="text-primary font-semibold">{item.seedPrice}</TableCell>
                      <TableCell className="text-accent font-semibold">{item.cropPrice}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
