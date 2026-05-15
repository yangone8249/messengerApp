// =============================================
// Chat Service - 데이터 접근 추상화 레이어
//
// 현재: 더미 데이터 반환
// 나중에 Firebase/서버 연동 시 이 파일만 수정하면 됨
// 화면 컴포넌트(screens)는 이 서비스만 바라보므로
// 내부 구현이 바뀌어도 화면 코드는 변경 불필요
// =============================================

import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { addDoc, collection, deleteDoc, deleteField, doc, getDocs, getFirestore, increment, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Chat, Message } from '../types';
import app from './firebase';
import { supabase } from './supabase';
import { getUser } from './userService';

const db = getFirestore(app);

/**
 * 채팅방 개설
 * 두 유저 간 기존 채팅방이 있으면 해당 roomId 반환, 없으면 새로 생성
 * myUid는 서비스에서 직접 가져오지 않고 호출하는 쪽(컴포넌트)에서 넘겨줌
 * → 서비스 파일은 React 컴포넌트가 아니라 훅(useAuth) 사용 불가
 */
export async function openChatRoom(myUid: string, targetUid: string): Promise<string> {
  const isSelf = myUid === targetUid;

  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', myUid)
  );
  const snapshot = await getDocs(q);

  const existing = snapshot.docs.find(doc => {
    const participants: string[] = doc.data().participants;
    console.log("participants : ",participants);
    if (isSelf) {
      // 자기 자신과의 채팅방: uid 1개짜리 방만 해당
      console.log("나와 채팅 시작");
      return participants.length === 1 && participants[0] === myUid;
    }
    console.log("상대와 채팅 시작");
    return participants.includes(targetUid);
  });

  
  console.log("existing : ",existing);
  if (existing) {
    console.log("existing.id : ",existing?.id);
    return existing.id;
  }
  console.log("신규 방 생성");

  const participantList = isSelf ? [myUid] : [myUid, targetUid];
  const unreadCounts: Record<string, number> = {};
  participantList.forEach(uid => { unreadCounts[uid] = 0; });

  const docRef = await addDoc(collection(db, 'chatRooms'), {
    participants: participantList,
    type: isSelf ? 'self' : 'direct',
    lastMessage: '',
    unreadCounts,
    createdAt: new Date(),
  });
  return docRef.id;
}

/**
 * 채팅방 목록 가져오기
 * Firebase: collection('chats').where('participants', 'array-contains', userId)
 */
export async function getChats(myUid: string): Promise<Chat[]> {
  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', myUid),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);


    console.log("getChats() 함수 진입!!!!");

  const chats = await Promise.all(
    
      

    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      console.log("data : ",data);
      
      const participantUids: string[] = data.participants;
      console.log("participantUids : ",participantUids);
      
      const participants = await Promise.all(
        participantUids.map(async (uid) => {
          const profile = await getUser(uid);
          return { id: uid, name: profile?.name ?? uid };
        })
      );
      console.log("participants : ",participants);

      return {
        id: docSnap.id,
        type: data.type ?? 'direct',
        participants,
        lastMessage: data.lastMessage,
        unreadCounts: data.unreadCounts ?? {},
        unreadCount: 0,
        updatedAt: data.updatedAt ?? data.createdAt ?? Date.now(),
      } as Chat;
    })
  );

  // 채팅 기록이 있는 방만 반환 (lastMessage가 빈 문자열이거나 없으면 제외)
  return chats.filter(chat => chat.lastMessage != null && chat.lastMessage !== ('' as any));
}

/**
 * 채팅방 목록 실시간 구독 (onSnapshot)
 */
export function subscribeChats(
  myUid: string,
  callback: (chats: Chat[]) => void
): () => void {
  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', myUid),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const chats = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const participantUids: string[] = data.participants;

        const participants = await Promise.all(
          participantUids.map(async (uid) => {
            const profile = await getUser(uid);
            return { id: uid, name: profile?.name ?? uid };
          })
        );

        return {
          id: docSnap.id,
          type: data.type ?? 'direct',
          participants,
          lastMessage: data.lastMessage,
          unreadCounts: data.unreadCounts ?? {},
          unreadCount: 0,
          updatedAt: data.updatedAt ?? data.createdAt ?? Date.now(),
        } as Chat;
      })
    );

    callback(chats.filter(chat => chat.lastMessage != null && chat.lastMessage !== ('' as any)));
  });

  return unsubscribe;
}

/**
 * 채팅방 나가기
 * - 내 uid를 participants에서 제거
 * - 참가자가 없으면 방 자체 삭제
 */
export async function leaveChat(chatId: string, myUid: string): Promise<void> {
  const roomRef = doc(db, 'chatRooms', chatId);
  const roomSnap = await getDocs(query(collection(db, 'chatRooms'), where('__name__', '==', chatId)));
  const participants: string[] = roomSnap.docs[0]?.data().participants ?? [];
  const remaining = participants.filter(uid => uid !== myUid);

  console.log("leaveChat 진입")
  console.log("remaining : ",remaining)
  if (remaining.length === 0) {
    await deleteDoc(roomRef);
  } else {
    await updateDoc(roomRef, {
      participants: remaining,
      [`unreadCounts.${myUid}`]: deleteField(),
    });
  }
}

/**
 * 채팅방 입장 시 내 unreadCounts 0으로 초기화
 */
export async function markAsRead(chatId: string, myUid: string): Promise<void> {
  await updateDoc(doc(db, 'chatRooms', chatId), {
    [`unreadCounts.${myUid}`]: 0,
  });
}

/**
 * 특정 채팅방의 메시지 목록 가져오기 (1회성)
 */
export async function getMessages(chatId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'chatRooms', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
}

/**
 * 메시지 실시간 구독 (onSnapshot)
 * 메시지가 추가될 때마다 callback 자동 호출
 * 반환값(unsubscribe)을 useEffect 클린업에서 호출해서 구독 해제
 */
export function subscribeMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, 'chatRooms', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  });
  return unsubscribe;
}

/**
 * 파일/이미지 메시지 전송
 * 1) Firebase Storage에 파일 업로드
 * 2) Firestore에 fileUrl 포함 메시지 저장
 */
export async function sendFileMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  fileUri: string,
  fileType: 'image' | 'file',
  fileName: string,
): Promise<Message> {
    console.log("chatService.ts -> sendFileMessage 함수 실행")
  const BUCKET = 'massager-app-files';
  const ext = fileName.split('.').pop() ?? 'bin';
  const storagePath = `chats/${chatId}/${Date.now()}.${ext}`;

  const mimeType = fileType === 'image' ? `image/${ext}` : `application/${ext}`;
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decode(base64);

    console.log("BUCKET : ",BUCKET)
    console.log("ext : ",ext)
    console.log("storagePath : ",storagePath)
    console.log("mimeType : ",mimeType)
    console.log("arrayBuffer : ",arrayBuffer)
  
    console.log("1")
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, { contentType: mimeType, upsert: false });
    
    
    console.log("uploadError : ",uploadError)
  if (uploadError) throw uploadError;

    console.log("2")
  const { data: signedData, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
  if (signError) throw signError;

  
    console.log("3")
  const fileUrl = signedData.signedUrl;

    console.log("4")
  const docRef = await addDoc(
    collection(db, 'chatRooms', chatId, 'messages'),
    {
      chatId,
      senderId,
      senderName,
      text: fileType === 'image' ? '📷 이미지' : `📎 ${fileName}`,
      fileUrl,
      fileType,
      fileName,
      createdAt: Date.now(),
      isRead: false,
    }
  );

    console.log("5")
  const roomRef = doc(db, 'chatRooms', chatId);
  const roomSnap = await getDocs(query(collection(db, 'chatRooms'), where('__name__', '==', chatId)));
  const participants: string[] = roomSnap.docs[0]?.data().participants ?? [];
  const updates: Record<string, any> = {
    lastMessage: fileType === 'image' ? '📷 이미지' : `📎 ${fileName}`,
    updatedAt: Date.now(),
  };
  
    console.log("6")
  participants.forEach(uid => {
    if (uid !== senderId) updates[`unreadCounts.${uid}`] = increment(1);
  });
  await updateDoc(roomRef, updates);

    console.log("7")
  return {
    id: docRef.id,
    chatId,
    senderId,
    senderName,
    text: fileType === 'image' ? '📷 이미지' : `📎 ${fileName}`,
    fileUrl,
    fileType,
    fileName,
    createdAt: Date.now(),
    isRead: false,
  };
}

/**
 * 메시지 전송
 * Firebase: collection('messages').add(message)
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<Message> {

  console.log("chatService.ts 진입")
  console.log("sendMessage 함수 진입")
  console.log("addDoc [chatId : ", chatId, ", senderId : ",senderId, ", senderName : ",senderName, ", text : ",text, "]",)
  // Firestore에 메시지 저장
  const docRef = await addDoc(
    collection(db, 'chatRooms', chatId, 'messages'),
    {
      chatId,
      senderId,
      senderName,
      text,
      createdAt: Date.now(),
      isRead: false,
    }
  );

  // 채팅방 lastMessage 업데이트 + 상대방 unreadCounts +1
  const roomRef = doc(db, 'chatRooms', chatId);
  const roomSnap = await getDocs(query(collection(db, 'chatRooms'), where('__name__', '==', chatId)));
  const participants: string[] = roomSnap.docs[0]?.data().participants ?? [];

  const updates: Record<string, any> = {
    lastMessage: text,
    updatedAt: Date.now(),
  };
  participants.forEach(uid => {
    if (uid !== senderId) {
      updates[`unreadCounts.${uid}`] = increment(1);
    }
  });
  await updateDoc(roomRef, updates);

 

  return {
    id: docRef.id,
    chatId,
    senderId,
    senderName,
    text,
    createdAt: Date.now(),
    isRead: false,
  };
}
