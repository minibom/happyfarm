
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, DatabaseZap, ServerCog, BarChartHorizontalBig, Gift, BarChart3, Mail } from 'lucide-react'; // Added Mail icon
import { useToast } from '@/hooks/use-toast';
import { CROP_DATA, FERTILIZER_DATA, BONUS_CONFIGURATIONS_DATA, TIER_DATA } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import type { CropId, CropDetails, FertilizerId, FertilizerDetails, BonusConfiguration, TierDataFromFirestore } from '@/types';
import type { TierDetail } from '@/lib/tier-data';

export default function AdminConfigPage() {
  const { toast } = useToast();

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

  const handlePushBonusConfigs = async () => {
    toast({
      title: "Đang Xử Lý...",
      description: "Bắt đầu đẩy dữ liệu Cấu Hình Bonus lên Firestore...",
      duration: 3000,
    });
    try {
      const batch = writeBatch(db);
      let bonusConfigCount = 0;

      for (const bonusConfig of BONUS_CONFIGURATIONS_DATA) {
        const configRef = doc(db, 'gameBonusConfigurations', bonusConfig.id);
        batch.set(configRef, bonusConfig);
        bonusConfigCount++;
      }
      
      await batch.commit();
      toast({
        title: "Thành Công!",
        description: `Đã đẩy ${bonusConfigCount} cấu hình bonus từ 'constants.ts' lên Firestore.`,
        duration: 7000,
        className: "bg-green-500 text-white"
      });

    } catch (error) {
      console.error("Error pushing bonus configurations to Firestore:", error);
       toast({
        title: "Lỗi Đẩy Cấu Hình Bonus",
        description: `Không thể đẩy dữ liệu cấu hình bonus. Lỗi: ${(error as Error).message}`,
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


  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardContent className="space-y-6 p-6">
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
                  Sử dụng để khởi tạo hoặc GHI ĐÈ dữ liệu bonus trên database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handlePushBonusConfigs} className="bg-purple-500 hover:bg-purple-600 text-white">
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Đẩy Cấu Hình Bonus
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  GHI ĐÈ dữ liệu trên <code>gameBonusConfigurations</code>.
                </p>
              </CardContent>
            </Card>
          </div>

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
                  Sử dụng để khởi tạo hoặc GHI ĐÈ dữ liệu cấp bậc trên database.
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
                    <CardTitle className="text-xl">Đồng Bộ Temp Thư (Placeholder)</CardTitle>
                </div>
                <CardDescription>
                  Khu vực này có thể chứa các tiện ích đồng bộ dữ liệu thư mẫu. (Sắp có)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled className="mt-2">Đồng Bộ Thư Mẫu</Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-500/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <BarChartHorizontalBig className="h-6 w-6 text-blue-500" />
                    <CardTitle className="text-xl">Quản Lý Sự Kiện Game (Placeholder)</CardTitle>
                </div>
                <CardDescription>
                  Khu vực này có thể chứa các cài đặt cho sự kiện trong game. (Sắp có)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled className="mt-2">Thiết Lập Sự Kiện Mới</Button>
              </CardContent>
            </Card>
            
            <Card className="border-orange-500/50">
              <CardHeader>
                  <div className="flex items-center gap-2">
                    <ServerCog className="h-6 w-6 text-orange-500" />
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
          </div>

        </CardContent>
      </Card>
    </div>
  );
}


    