
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TiersDisplay from '@/components/library/TiersDisplay';
import CropsDisplay from '@/components/library/CropsDisplay';
import { Award, Sprout } from 'lucide-react';

export default function LibraryPage() {
  return (
    <Tabs defaultValue="tiers" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="tiers" className="py-3 text-base">
          <Award className="mr-2 h-5 w-5" /> Các Cấp Bậc
        </TabsTrigger>
        <TabsTrigger value="crops" className="py-3 text-base">
          <Sprout className="mr-2 h-5 w-5" /> Thông Tin Cây Trồng
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tiers">
        <TiersDisplay />
      </TabsContent>
      <TabsContent value="crops">
        <CropsDisplay />
      </TabsContent>
    </Tabs>
  );
}
