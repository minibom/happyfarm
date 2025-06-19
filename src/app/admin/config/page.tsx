
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, DatabaseZap, ServerCog, BarChartHorizontalBig, Gift, BarChart3, Mail, CalendarCog, Store, ListChecks } from 'lucide-react'; // Added Store icon and ListChecks
import { useToast } from '@/hooks/use-toast';
import {
  CROP_DATA,
  FERTILIZER_DATA,
  BONUS_CONFIGURATIONS_DATA,
  TIER_DATA,
  MAIL_TEMPLATES_DATA,
  GAME_EVENT_TEMPLATES_DATA,
  INITIAL_MARKET_STATE,
  MAIN_MISSIONS_DATA,                 // New Mission Data
  DAILY_MISSION_TEMPLATES_DATA,     // New Mission Data
  WEEKLY_MISSION_TEMPLATES_DATA,    // New Mission Data
  RANDOM_MISSION_POOL_DATA,         // New Mission Data
} from '@/lib/constants';
import { db } from '@/lib/firebase';
import { doc, setDoc, writeBatch, getDoc } from 'firebase/firestore';
import type { CropId, CropDetails, FertilizerId, FertilizerDetails, BonusConfiguration, TierDataFromFirestore, GameEventConfig, MarketState, Mission } from '@/types'; // Added Mission type
import type { TierDetail } from '@/lib/tier-data';
import type { MailTemplate } from '@/lib/mail-templates';

export default function AdminConfigPage() {
  const { toast } = useToast();
  const [isSyncingMissions, setIsSyncingMissions] = useState(false);


  const handlePushGenericData = async (
    dataArray: any[],
    collectionName: string,
    docIdField: string, // Field in the data object to use as Document ID
    dataTypeLabel: string
  ) => {
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
        batch.set(itemRef, item);
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
    }
  };


  const handlePushCropFertilizerData = async () => {
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
    }
  };

  const handlePushTierData = async () => {
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
    }
  };


  const handleInitializeMarketState = async () => {
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
    }
  };

  const handlePushAllMissionData = async () => {
    setIsSyncingMissions(true);
    try {
      await handlePushGenericData(MAIN_MISSIONS_DATA, 'gameMainMissions', 'id', 'Nhiệm Vụ Chính');
      await handlePushGenericData(DAILY_MISSION_TEMPLATES_DATA, 'gameDailyMissionTemplates', 'id', 'Mẫu NV Ngày');
      await handlePushGenericData(WEEKLY_MISSION_TEMPLATES_DATA, 'gameWeeklyMissionTemplates', 'id', 'Mẫu NV Tuần');
      await handlePushGenericData(RANDOM_MISSION_POOL_DATA, 'gameRandomMissionPool', 'id', 'NV Ngẫu Nhiên');
      toast({
        title: "Đồng Bộ Hoàn Tất!",
        description: "Tất cả dữ liệu nhiệm vụ đã được đồng bộ lên Firestore.",
        className: "bg-green-500 text-white",
        duration: 7000,
      });
    } catch (error) {
      // Individual errors are handled by handlePushGenericData
      toast({
        title: "Lỗi Đồng Bộ Tổng Thể",
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
                  Đẩy TOÀN BỘ cấu hình Cây Trồng từ <code>constants.ts</code> lên <code>gameItems</code>
                  VÀ Phân Bón lên <code>gameFertilizers</code>.
                  Sử dụng để khởi tạo hoặc GHI ĐÈ dữ liệu trên database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handlePushCropFertilizerData} className="bg-accent hover:bg-accent/90">
                  <UploadCloud className="mr-2 h-5 w-5" />
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
                  Đẩy TOÀN BỘ cấu hình Bonus từ <code>constants.ts</code>
                  lên collection <code>gameBonusConfigurations</code> trong Firestore.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handlePushGenericData(BONUS_CONFIGURATIONS_DATA, 'gameBonusConfigurations', 'id', 'Cấu Hình Bonus')} className="bg-purple-500 hover:bg-purple-600 text-white">
                  <UploadCloud className="mr-2 h-5 w-5" />
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
                  Đẩy TOÀN BỘ cấu hình Cấp Bậc (Tiers) từ <code>constants.ts</code>
                  lên collection <code>gameTiers</code> trong Firestore.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handlePushTierData} className="bg-sky-500 hover:bg-sky-600 text-white">
                  <UploadCloud className="mr-2 h-5 w-5" />
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
                <Button onClick={() => handlePushGenericData(MAIL_TEMPLATES_DATA, 'gameMailTemplates', 'id', 'Thư Mẫu')} className="bg-teal-500 hover:bg-teal-600 text-white">
                    <UploadCloud className="mr-2 h-5 w-5" />
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
                <Button onClick={() => handlePushGenericData(GAME_EVENT_TEMPLATES_DATA, 'gameEventTemplates', 'id', 'Mẫu Sự Kiện')} className="bg-blue-500 hover:bg-blue-600 text-white">
                    <UploadCloud className="mr-2 h-5 w-5" />
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
                  Khởi tạo hoặc đặt lại tài liệu <code>marketState/global</code> với dữ liệu mặc định.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={handleInitializeMarketState} className="bg-orange-400 hover:bg-orange-500 text-white">
                    <UploadCloud className="mr-2 h-5 w-5" />
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
            <Card className="border-indigo-500/50 md:col-span-2"> {/* Make this card span 2 columns on md+ screens */}
              <CardHeader>
                <div className="flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-indigo-500" />
                    <CardTitle className="text-xl">Đồng Bộ Định Nghĩa Nhiệm Vụ</CardTitle>
                </div>
                <CardDescription>
                  Đẩy TOÀN BỘ cấu hình Nhiệm Vụ từ <code>mission-data.ts</code> (thông qua <code>constants.ts</code>)
                  lên các collection tương ứng (<code>gameMainMissions</code>, <code>gameDailyMissionTemplates</code>, etc.) trong Firestore.
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
            {/* Placeholder for another card if needed, or leave one empty
            This div will be empty on md+ screens because the mission card spans 2 columns.
            On smaller screens, it will just be an empty div below the mission card. */}
            <div></div>
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

  