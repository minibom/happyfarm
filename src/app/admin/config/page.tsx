
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, DatabaseZap, ServerCog, BarChartHorizontalBig, Gift, BarChart3, Mail, CalendarCog, Store, ListChecks, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  CROP_DATA,
  FERTILIZER_DATA,
  BONUS_CONFIGURATIONS_DATA,
  TIER_DATA,
  MAIL_TEMPLATES_DATA,
  GAME_EVENT_TEMPLATES_DATA,
  INITIAL_MARKET_STATE,
  MAIN_MISSIONS_DATA,
  DAILY_MISSION_TEMPLATES_DATA,
  WEEKLY_MISSION_TEMPLATES_DATA,
  RANDOM_MISSION_POOL_DATA,
} from '@/lib/constants';
import { db } from '@/lib/firebase';
import { doc, setDoc, writeBatch, getDoc } from 'firebase/firestore';
import type { CropId, CropDetails, FertilizerId, FertilizerDetails, BonusConfiguration, TierDataFromFirestore, GameEventConfig, MarketState, Mission } from '@/types';
import type { TierDetail } from '@/lib/tier-data';
import type { MailTemplate } from '@/lib/mail-templates';

export default function AdminConfigPage() {
  const { toast } = useToast();
  const [isSyncingMissions, setIsSyncingMissions] = useState(false);
  const [isSyncingItems, setIsSyncingItems] = useState(false);
  const [isSyncingBonuses, setIsSyncingBonuses] = useState(false);
  const [isSyncingTiers, setIsSyncingTiers] = useState(false);
  const [isSyncingMailTemplates, setIsSyncingMailTemplates] = useState(false);
  const [isSyncingEventTemplates, setIsSyncingEventTemplates] = useState(false);
  const [isInitializingMarket, setIsInitializingMarket] = useState(false);


  const handlePushGenericData = async (
    dataArray: any[],
    collectionName: string,
    docIdField: string,
    dataTypeLabel: string,
    setLoadingState?: (loading: boolean) => void
  ) => {
    setLoadingState?.(true);
    toast({
      title: "Đang Xử Lý...",
      description: `Bắt đầu đẩy dữ liệu ${dataTypeLabel} lên Firestore...`,
      duration: 3000,
    });

    try {
      const batch = writeBatch(db);
      let itemCount = 0;

      for (const item of dataArray) {
        if (!item[docIdField]) {
          console.warn(`Skipping item in ${dataTypeLabel} due to missing ID field '${docIdField}':`, item);
          continue;
        }
        const itemRef = doc(db, collectionName, item[docIdField]);
        
        // Create a clean version of the item, removing undefined fields
        const cleanItem: Record<string, any> = {};
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key) && item[key] !== undefined) {
                cleanItem[key] = item[key];
            }
        }
        
        batch.set(itemRef, cleanItem); // Use the clean item
        itemCount++;
      }

      await batch.commit();
      toast({
        title: "Thành Công!",
        description: `Đã đẩy ${itemCount} ${dataTypeLabel} lên Firestore collection '${collectionName}'.`,
        duration: 7000,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error(`Error pushing ${dataTypeLabel} to Firestore:`, error);
      toast({
        title: `Lỗi Đẩy Dữ Liệu ${dataTypeLabel}`,
        description: `Không thể đẩy dữ liệu. Lỗi: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingState?.(false);
    }
  };


  const handlePushCropFertilizerData = async () => {
    setIsSyncingItems(true);
    toast({
      title: "Đang Xử Lý...",
      description: "Bắt đầu đẩy dữ liệu Cây Trồng & Phân Bón lên Firestore...",
      duration: 3000,
    });

    try {
      const batch = writeBatch(db);
      let cropItemCount = 0;
      let fertilizerItemCount = 0;

      for (const cropId in CROP_DATA) {
        if (Object.prototype.hasOwnProperty.call(CROP_DATA, cropId)) {
          const itemData: CropDetails = CROP_DATA[cropId as CropId];
          const itemRef = doc(db, 'gameItems', cropId);
          batch.set(itemRef, itemData);
          cropItemCount++;
        }
      }

      for (const fertilizerId in FERTILIZER_DATA) {
        if (Object.prototype.hasOwnProperty.call(FERTILIZER_DATA, fertilizerId)) {
          const fertilizerDetails: FertilizerDetails = FERTILIZER_DATA[fertilizerId as FertilizerId];
          const fertRef = doc(db, 'gameFertilizers', fertilizerId);
          batch.set(fertRef, fertilizerDetails);
          fertilizerItemCount++;
        }
      }

      await batch.commit();

      toast({
        title: "Thành Công!",
        description: `Đã đẩy ${cropItemCount} cây trồng và ${fertilizerItemCount} phân bón từ 'constants.ts' lên Firestore.`,
        duration: 7000,
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error("Error pushing crop/fertilizer data to Firestore:", error);
      toast({
        title: "Lỗi Đẩy Dữ Liệu",
        description: `Không thể đẩy dữ liệu Cây Trồng/Phân Bón. Lỗi: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncingItems(false);
    }
  };

  const handlePushTierData = async () => {
    setIsSyncingTiers(true);
    toast({
      title: "Đang Xử Lý...",
      description: "Bắt đầu đẩy dữ liệu Cấp Bậc (Tiers) lên Firestore...",
      duration: 3000,
    });
    try {
      const batch = writeBatch(db);
      let tierCount = 0;

      TIER_DATA.forEach((tierDetail: TierDetail, index: number) => {
        const tierId = `tier_${index + 1}`;
        const dataToPush: TierDataFromFirestore = { ...tierDetail };
        const tierRef = doc(db, 'gameTiers', tierId);
        batch.set(tierRef, dataToPush);
        tierCount++;
      });

      await batch.commit();
      toast({
        title: "Thành Công!",
        description: `Đã đẩy ${tierCount} cấp bậc từ 'constants.ts' lên Firestore collection 'gameTiers'.`,
        duration: 7000,
        className: "bg-green-500 text-white"
      });

    } catch (error) {
      console.error("Error pushing tier data to Firestore:", error);
       toast({
        title: "Lỗi Đẩy Dữ Liệu Cấp Bậc",
        description: `Không thể đẩy dữ liệu cấp bậc. Lỗi: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncingTiers(false);
    }
  };


  const handleInitializeMarketState = async () => {
    setIsInitializingMarket(true);
    toast({
      title: "Đang Xử Lý...",
      description: "Khởi tạo/Đặt lại trạng thái Chợ...",
      duration: 3000,
    });
    try {
      const marketDocRef = doc(db, 'marketState', 'global');
      await setDoc(marketDocRef, INITIAL_MARKET_STATE);

      toast({
        title: "Thành Công!",
        description: "Trạng thái Chợ đã được khởi tạo/đặt lại với dữ liệu mặc định.",
        duration: 7000,
        className: "bg-green-500 text-white"
      });

    } catch (error) {
      console.error("Error initializing/resetting market state:", error);
       toast({
        title: "Lỗi Khởi Tạo Chợ",
        description: `Không thể khởi tạo/đặt lại trạng thái chợ. Lỗi: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsInitializingMarket(false);
    }
  };

  const handlePushAllMissionData = async () => {
    setIsSyncingMissions(true);
    try {
      await handlePushGenericData(MAIN_MISSIONS_DATA, 'gameMainMissions', 'id', 'Nhiệm Vụ Chính', setIsSyncingMissions); // Pass correct setter
      await handlePushGenericData(DAILY_MISSION_TEMPLATES_DATA, 'gameDailyMissionTemplates', 'id', 'Mẫu NV Ngày', setIsSyncingMissions);
      await handlePushGenericData(WEEKLY_MISSION_TEMPLATES_DATA, 'gameWeeklyMissionTemplates', 'id', 'Mẫu NV Tuần', setIsSyncingMissions);
      await handlePushGenericData(RANDOM_MISSION_POOL_DATA, 'gameRandomMissionPool', 'id', 'NV Ngẫu Nhiên', setIsSyncingMissions);
      toast({
        title: "Đồng Bộ Hoàn Tất!",
        description: "Tất cả dữ liệu nhiệm vụ đã được đồng bộ lên Firestore.",
        className: "bg-green-500 text-white",
        duration: 7000,
      });
    } catch (error) {
      toast({
        title: "Lỗi Đồng Bộ Tổng Thể Nhiệm Vụ",
        description: "Một hoặc nhiều loại nhiệm vụ không thể đồng bộ. Kiểm tra console.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingMissions(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardContent className="space-y-6 p-6">
          {/* Row 1 */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <DatabaseZap className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Đồng Bộ Cây Trồng & Phân Bón</CardTitle>
                </div>
                <CardDescription>
                  Đẩy TOÀN BỘ cấu hình Cây Trồng từ <code>crop-data.ts</code> lên <code>gameItems</code>
                  VÀ Phân Bón từ <code>fertilizer-data.ts</code> lên <code>gameFertilizers</code>.
                  Sử dụng để khởi tạo hoặc GHI ĐÈ dữ liệu trên database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handlePushCropFertilizerData} className="bg-accent hover:bg-accent/90" disabled={isSyncingItems}>
                  {isSyncingItems ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                  Đẩy Dữ Liệu Cây Trồng & Phân Bón
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  GHI ĐÈ dữ liệu trên <code>gameItems</code> và <code>gameFertilizers</code>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <Gift className="h-6 w-6 text-purple-500" />
                    <CardTitle className="text-xl">Đồng Bộ Cấu Hình Bonus</CardTitle>
                </div>
                <CardDescription>
                  Đẩy TOÀN BỘ cấu hình Bonus từ <code>bonus-configurations.ts</code>
                  lên collection <code>gameBonusConfigurations</code> trong Firestore.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handlePushGenericData(BONUS_CONFIGURATIONS_DATA, 'gameBonusConfigurations', 'id', 'Cấu Hình Bonus', setIsSyncingBonuses)} className="bg-purple-500 hover:bg-purple-600 text-white" disabled={isSyncingBonuses}>
                  {isSyncingBonuses ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                  Đẩy Cấu Hình Bonus
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  GHI ĐÈ dữ liệu trên <code>gameBonusConfigurations</code>.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-sky-500/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-sky-500" />
                    <CardTitle className="text-xl">Đồng Bộ Dữ Liệu Cấp Bậc (Tiers)</CardTitle>
                </div>
                <CardDescription>
                  Đẩy TOÀN BỘ cấu hình Cấp Bậc (Tiers) từ <code>tier-data.ts</code>
                  lên collection <code>gameTiers</code> trong Firestore.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handlePushTierData} className="bg-sky-500 hover:bg-sky-600 text-white" disabled={isSyncingTiers}>
                  {isSyncingTiers ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                  Đẩy Dữ Liệu Cấp Bậc
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  GHI ĐÈ dữ liệu trên <code>gameTiers</code>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-teal-500/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <Mail className="h-6 w-6 text-teal-500" />
                    <CardTitle className="text-xl">Đồng Bộ Thư Mẫu</CardTitle>
                </div>
                <CardDescription>
                  Đẩy TOÀN BỘ Thư Mẫu từ <code>mail-templates.ts</code>
                  lên collection <code>gameMailTemplates</code> trong Firestore.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handlePushGenericData(MAIL_TEMPLATES_DATA, 'gameMailTemplates', 'id', 'Thư Mẫu', setIsSyncingMailTemplates)} className="bg-teal-500 hover:bg-teal-600 text-white" disabled={isSyncingMailTemplates}>
                    {isSyncingMailTemplates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                    Đồng Bộ Thư Mẫu
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  GHI ĐÈ dữ liệu trên <code>gameMailTemplates</code>.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Row 3 */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-500/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <CalendarCog className="h-6 w-6 text-blue-500" />
                    <CardTitle className="text-xl">Đồng Bộ Mẫu Sự Kiện</CardTitle>
                </div>
                <CardDescription>
                  Đẩy TOÀN BỘ Mẫu Sự Kiện từ <code>event-templates.ts</code>
                  lên collection <code>gameEventTemplates</code> trong Firestore.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handlePushGenericData(GAME_EVENT_TEMPLATES_DATA, 'gameEventTemplates', 'id', 'Mẫu Sự Kiện', setIsSyncingEventTemplates)} className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isSyncingEventTemplates}>
                    {isSyncingEventTemplates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                    Đồng Bộ Mẫu Sự Kiện
                </Button>
                 <p className="mt-2 text-sm text-muted-foreground">
                  GHI ĐÈ dữ liệu trên <code>gameEventTemplates</code>.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-400/50">
              <CardHeader>
                  <div className="flex items-center gap-2">
                    <Store className="h-6 w-6 text-orange-400" />
                    <CardTitle className="text-xl">Khởi Tạo Trạng Thái Chợ</CardTitle>
                  </div>
                  <CardDescription>
                  Khởi tạo hoặc đặt lại tài liệu <code>marketState/global</code> với dữ liệu mặc định từ <code>initial-states.ts</code>.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={handleInitializeMarketState} className="bg-orange-400 hover:bg-orange-500 text-white" disabled={isInitializingMarket}>
                    {isInitializingMarket ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                    Khởi Tạo/Reset Chợ
                  </Button>
                   <p className="mt-2 text-sm text-muted-foreground">
                    GHI ĐÈ dữ liệu trên <code>marketState/global</code>.
                  </p>
              </CardContent>
            </Card>
          </div>

           {/* New Row for Missions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-indigo-500/50 md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-indigo-500" />
                    <CardTitle className="text-xl">Đồng Bộ Định Nghĩa Nhiệm Vụ</CardTitle>
                </div>
                <CardDescription>
                  Đẩy TOÀN BỘ cấu hình Nhiệm Vụ từ <code>mission-data.ts</code> (thông qua <code>constants.ts</code>)
                  lên các collection tương ứng (<code>gameMainMissions</code>, <code>gameDailyMissionTemplates</code>, etc.) trong Firestore.
                  Sử dụng để khởi tạo hoặc GHI ĐÈ dữ liệu trên database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handlePushAllMissionData} className="bg-indigo-500 hover:bg-indigo-600 text-white" disabled={isSyncingMissions}>
                    {isSyncingMissions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                    Đồng Bộ Tất Cả Nhiệm Vụ
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  GHI ĐÈ dữ liệu trên các collection nhiệm vụ.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <Card className="border-gray-500/50">
              <CardHeader>
                  <div className="flex items-center gap-2">
                    <ServerCog className="h-6 w-6 text-gray-500" />
                    <CardTitle className="text-xl">Thông Báo Hệ Thống (Placeholder)</CardTitle>
                  </div>
                  <CardDescription>
                  Gửi thông báo chung cho tất cả người chơi trong game. (Sắp có)
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button variant="outline" disabled className="mt-2">Soạn Thông Báo</Button>
              </CardContent>
            </Card>
            <div></div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
