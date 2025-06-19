
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  getDoc,
  getDocs,
  type Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from './useAuth';
import type { FriendInfo, FriendRequestSent, FriendRequestReceived, GameState } from '@/types';
import { useToast } from './use-toast';

export const useFriends = () => {
  const { userId, user } = useAuth();
  const { toast } = useToast();

  const [friendsList, setFriendsList] = useState<FriendInfo[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestReceived[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestSent[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]); // Store UIDs of blocked users
  const [loadingFriendsData, setLoadingFriendsData] = useState(true);

  const unreadRequestCount = useMemo(() => {
    return incomingRequests.filter(req => req.status === 'pending').length;
  }, [incomingRequests]);

  // Fetch friends
  useEffect(() => {
    if (!userId) {
      setFriendsList([]);
      setLoadingFriendsData(false);
      return;
    }
    setLoadingFriendsData(true);
    const friendsRef = collection(db, 'users', userId, 'friends');
    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      const fetchedFriends: FriendInfo[] = [];
      snapshot.forEach((doc) => {
        fetchedFriends.push({ uid: doc.id, ...doc.data() } as FriendInfo);
      });
      setFriendsList(fetchedFriends.sort((a,b) => a.displayName.localeCompare(b.displayName)));
      setLoadingFriendsData(false);
    }, (error) => {
      console.error("Error fetching friends list:", error);
      toast({ title: "Lỗi", description: "Không thể tải danh sách bạn bè.", variant: "destructive" });
      setLoadingFriendsData(false);
    });
    return () => unsubscribe();
  }, [userId, toast]);

  // Fetch incoming friend requests
  useEffect(() => {
    if (!userId) {
      setIncomingRequests([]);
      return;
    }
    const requestsRef = collection(db, 'users', userId, 'friendRequestsReceived');
    const q = query(requestsRef, where('status', '==', 'pending'), orderBy('receivedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: FriendRequestReceived[] = [];
      snapshot.forEach((doc) => {
        fetchedRequests.push({ senderId: doc.id, ...doc.data() } as FriendRequestReceived);
      });
      setIncomingRequests(fetchedRequests);
    }, (error) => {
      console.error("Error fetching incoming friend requests:", error);
      toast({ title: "Lỗi", description: "Không thể tải lời mời kết bạn.", variant: "destructive" });
    });
    return () => unsubscribe();
  }, [userId, toast]);

  // Fetch outgoing friend requests
  useEffect(() => {
    if (!userId) {
      setOutgoingRequests([]);
      return;
    }
    const requestsRef = collection(db, 'users', userId, 'friendRequestsSent');
    const q = query(requestsRef, where('status', '==', 'pending'), orderBy('sentAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: FriendRequestSent[] = [];
      snapshot.forEach((doc) => {
        fetchedRequests.push({ recipientId: doc.id, ...doc.data() } as FriendRequestSent);
      });
      setOutgoingRequests(fetchedRequests);
    }, (error) => {
      console.error("Error fetching outgoing friend requests:", error);
      // toast({ title: "Lỗi", description: "Không thể tải lời mời đã gửi.", variant: "destructive" });
    });
    return () => unsubscribe();
  }, [userId, toast]);
  
  // Fetch blocked users (simplified: just stores UIDs)
  useEffect(() => {
    if (!userId) {
        setBlockedUsers([]);
        return;
    }
    const blockedRef = collection(db, 'users', userId, 'blockedUsers');
    const unsubscribe = onSnapshot(blockedRef, (snapshot) => {
        const uids: string[] = [];
        snapshot.forEach(doc => uids.push(doc.id));
        setBlockedUsers(uids);
    }, (error) => {
        console.error("Error fetching blocked users:", error);
    });
    return () => unsubscribe();
  }, [userId]);


  const sendFriendRequest = useCallback(async (recipientId: string) => {
    if (!userId || !user ) { // Removed user.displayName check for now
      toast({ title: "Lỗi", description: "Bạn cần đăng nhập.", variant: "destructive" });
      return;
    }
    if (userId === recipientId) {
      toast({ title: "Lỗi", description: "Bạn không thể gửi lời mời cho chính mình.", variant: "destructive" });
      return;
    }
    if (friendsList.some(f => f.uid === recipientId)) {
        toast({ title: "Thông Báo", description: "Bạn đã là bạn bè với người này.", variant: "default" });
        return;
    }
    if (outgoingRequests.some(req => req.recipientId === recipientId && req.status === 'pending')) {
        toast({ title: "Thông Báo", description: "Bạn đã gửi lời mời cho người này rồi.", variant: "default" });
        return;
    }
    if (blockedUsers.includes(recipientId)) {
        toast({ title: "Bị Chặn", description: "Bạn đã chặn người này. Bỏ chặn để gửi lời mời.", variant: "destructive"});
        return;
    }

    try {
      const recipientGameStateDoc = await getDoc(doc(db, 'users', recipientId, 'gameState', 'data'));
      const recipientUserDoc = await getDoc(doc(db, 'users', recipientId));

      if (!recipientGameStateDoc.exists() && !recipientUserDoc.exists()) {
        toast({ title: "Lỗi", description: "Không tìm thấy người chơi này.", variant: "destructive" });
        return;
      }
      const recipientGameState = recipientGameStateDoc.data() as GameState | undefined;
      const recipientBaseData = recipientUserDoc.data();
      const recipientName = recipientGameState?.displayName || recipientBaseData?.displayName || recipientGameState?.email?.split('@')[0] || recipientBaseData?.email?.split('@')[0] || 'Người chơi';


      const currentUserGameStateDoc = await getDoc(doc(db, 'users', userId, 'gameState', 'data'));
      const currentUserGameState = currentUserGameStateDoc.data() as GameState | undefined;
      const currentUserBaseData = (await getDoc(doc(db, 'users', userId))).data();
      const senderName = currentUserGameState?.displayName || currentUserBaseData?.displayName || currentUserGameState?.email?.split('@')[0] || currentUserBaseData?.email?.split('@')[0] || 'Một người chơi';
      const senderLevel = currentUserGameState?.level || currentUserBaseData?.level || 1;


      const batch = writeBatch(db);
      const sentReqRef = doc(db, 'users', userId, 'friendRequestsSent', recipientId);
      batch.set(sentReqRef, {
        recipientName: recipientName,
        status: 'pending',
        sentAt: serverTimestamp(),
      });

      const receivedReqRef = doc(db, 'users', recipientId, 'friendRequestsReceived', userId);
      batch.set(receivedReqRef, {
        senderName: senderName,
        senderLevel: senderLevel,
        status: 'pending',
        receivedAt: serverTimestamp(),
      });

      await batch.commit();
      toast({ title: "Thành Công", description: `Đã gửi lời mời kết bạn đến ${recipientName}.`, className: "bg-green-500 text-white" });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({ title: "Lỗi", description: "Không thể gửi lời mời kết bạn.", variant: "destructive" });
      throw error;
    }
  }, [userId, user, toast, friendsList, outgoingRequests, blockedUsers]);

  const acceptFriendRequest = useCallback(async (senderId: string) => {
    if (!userId || !user) return; // Removed user.displayName check for now
    try {
      const senderGameStateDoc = await getDoc(doc(db, 'users', senderId, 'gameState', 'data'));
      const senderUserDoc = await getDoc(doc(db, 'users', senderId));
      if (!senderGameStateDoc.exists() && !senderUserDoc.exists()) throw new Error("Sender not found");
      
      const senderGameState = senderGameStateDoc.data() as GameState | undefined;
      const senderBaseData = senderUserDoc.data();
      const senderName = senderGameState?.displayName || senderBaseData?.displayName || senderGameState?.email?.split('@')[0] || senderBaseData?.email?.split('@')[0] || 'Người chơi';
      const senderLevel = senderGameState?.level || senderBaseData?.level || 1;

      const currentUserGameStateDoc = await getDoc(doc(db, 'users', userId, 'gameState', 'data'));
      const currentUserGameState = currentUserGameStateDoc.data() as GameState | undefined;
      const currentUserBaseData = (await getDoc(doc(db, 'users', userId))).data();
      const currentUserName = currentUserGameState?.displayName || currentUserBaseData?.displayName || currentUserGameState?.email?.split('@')[0] || currentUserBaseData?.email?.split('@')[0] || 'Một người chơi';
      const currentUserLevel = currentUserGameState?.level || currentUserBaseData?.level || 1;


      const batch = writeBatch(db);
      // Add to current user's friends list
      const currentUserFriendRef = doc(db, 'users', userId, 'friends', senderId);
      batch.set(currentUserFriendRef, {
        displayName: senderName,
        level: senderLevel,
        friendSince: serverTimestamp(),
      });
      // Add to sender's friends list
      const senderFriendRef = doc(db, 'users', senderId, 'friends', userId);
      batch.set(senderFriendRef, {
        displayName: currentUserName,
        level: currentUserLevel,
        friendSince: serverTimestamp(),
      });
      // Remove/update requests
      batch.delete(doc(db, 'users', userId, 'friendRequestsReceived', senderId));
      batch.delete(doc(db, 'users', senderId, 'friendRequestsSent', userId));
      await batch.commit();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({ title: "Lỗi", description: "Không thể chấp nhận lời mời.", variant: "destructive" });
      throw error;
    }
  }, [userId, user, toast]);

  const declineFriendRequest = useCallback(async (senderId: string) => {
    if (!userId) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', userId, 'friendRequestsReceived', senderId));
      batch.delete(doc(db, 'users', senderId, 'friendRequestsSent', userId)); // Also remove from sender's sent
      await batch.commit();
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast({ title: "Lỗi", description: "Không thể từ chối lời mời.", variant: "destructive" });
      throw error;
    }
  }, [userId, toast]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (!userId) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', userId, 'friends', friendId));
      batch.delete(doc(db, 'users', friendId, 'friends', userId));
      await batch.commit();
    } catch (error) {
      console.error("Error removing friend:", error);
      toast({ title: "Lỗi", description: "Không thể xóa bạn bè.", variant: "destructive" });
      throw error;
    }
  }, [userId, toast]);

  const blockUser = useCallback(async (userIdToBlock: string) => {
    if (!userId || userId === userIdToBlock) return;
    try {
        const batch = writeBatch(db);
        // Add to current user's blocked list
        const blockRef = doc(db, 'users', userId, 'blockedUsers', userIdToBlock);
        batch.set(blockRef, { blockedAt: serverTimestamp() });

        // Remove friend if they were friends
        batch.delete(doc(db, 'users', userId, 'friends', userIdToBlock));
        batch.delete(doc(db, 'users', userIdToBlock, 'friends', userId));

        // Remove any pending friend requests between them
        batch.delete(doc(db, 'users', userId, 'friendRequestsReceived', userIdToBlock));
        batch.delete(doc(db, 'users', userId, 'friendRequestsSent', userIdToBlock));
        batch.delete(doc(db, 'users', userIdToBlock, 'friendRequestsReceived', userId));
        batch.delete(doc(db, 'users', userIdToBlock, 'friendRequestsSent', userId));
        
        await batch.commit();
        toast({ title: "Đã chặn", description: "Người chơi đã bị chặn.", className: "bg-orange-500 text-white" });
    } catch (error) {
        console.error("Error blocking user:", error);
        toast({ title: "Lỗi", description: "Không thể chặn người chơi.", variant: "destructive" });
        throw error;
    }
  }, [userId, toast]);

  const unblockUser = useCallback(async (userIdToUnblock: string) => {
    if (!userId) return;
    try {
        await deleteDoc(doc(db, 'users', userId, 'blockedUsers', userIdToUnblock));
        toast({ title: "Đã bỏ chặn", description: "Người chơi đã được bỏ chặn.", className: "bg-green-500 text-white" });
    } catch (error) {
        console.error("Error unblocking user:", error);
        toast({ title: "Lỗi", description: "Không thể bỏ chặn người chơi.", variant: "destructive" });
        throw error;
    }
  }, [userId, toast]);

  return {
    friendsList,
    incomingRequests,
    outgoingRequests,
    unreadRequestCount,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    blockedUsers, // Expose blocked users list
    loadingFriendsData,
  };
};
