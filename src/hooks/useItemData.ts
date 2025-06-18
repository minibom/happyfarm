
'use client';

import { useState, useEffect } from 'react';
import type { CropId, CropDetails, FertilizerId, FertilizerDetails } from '@/types';
import { CROP_DATA as FALLBACK_CROP_DATA, FERTILIZER_DATA as FALLBACK_FERTILIZER_DATA } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const useItemData = () => {
  const [cropData, setCropData] = useState<Record<CropId, CropDetails> | null>(null);
  const [fertilizerData, setFertilizerData] = useState<Record<FertilizerId, FertilizerDetails> | null>(null);
  const [itemDataLoaded, setItemDataLoaded] = useState(false);
  const [fertilizerDataLoaded, setFertilizerDataLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCropItemData = async () => {
      try {
        const itemsCollectionRef = collection(db, 'gameItems');
        const querySnapshot = await getDocs(itemsCollectionRef);
        const fetchedItems: Record<CropId, CropDetails> = {};
        querySnapshot.forEach((docSnap) => {
          fetchedItems[docSnap.id as CropId] = docSnap.data() as CropDetails;
        });

        if (Object.keys(fetchedItems).length === 0) {
          console.warn("No items found in Firestore 'gameItems' collection. Using fallback data from constants.ts for crops.");
          setCropData(FALLBACK_CROP_DATA);
        } else {
          setCropData(fetchedItems);
        }
        setItemDataLoaded(true);
      } catch (error) {
        console.error("Failed to fetch crop data from Firestore:", error);
        toast({ title: "Lỗi Tải Vật Phẩm Cây Trồng", description: "Không thể tải dữ liệu cây trồng từ server. Sử dụng dữ liệu tạm.", variant: "destructive" });
        setCropData(FALLBACK_CROP_DATA); // Fallback to constants
        setItemDataLoaded(true);
      }
    };
    fetchCropItemData();
  }, [toast]);

  useEffect(() => {
    // Fertilizer data is currently static from constants
    setFertilizerData(FALLBACK_FERTILIZER_DATA);
    setFertilizerDataLoaded(true);
  }, []);

  return { cropData, fertilizerData, itemDataLoaded, fertilizerDataLoaded };
};
