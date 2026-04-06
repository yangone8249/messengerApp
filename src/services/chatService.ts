// =============================================
// Chat Service - 데이터 접근 추상화 레이어
//
// 현재: 더미 데이터 반환
// 나중에 Firebase/서버 연동 시 이 파일만 수정하면 됨
// 화면 컴포넌트(screens)는 이 서비스만 바라보므로
// 내부 구현이 바뀌어도 화면 코드는 변경 불필요
// =============================================

import { addDoc, collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { DUMMY_CHATS, DUMMY_MESSAGES } from '../data/dummyData';
import { Chat, Message } from '../types';
import app from './firebase';

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
  if (existing) return existing.id;

  console.log("신규 방 생성");

  const docRef = await addDoc(collection(db, 'chatRooms'), {
    participants: isSelf ? [myUid] : [myUid, targetUid],
    lastMessage: '',
    createdAt: new Date(),
  });
  return docRef.id;
}

/**
 * 채팅방 목록 가져오기
 * Firebase: collection('chats').where('participants', 'array-contains', userId)
 */
export async function getChats(myUid?: string): Promise<Chat[]> {

  // console.log("채팅방 목록 가져오기() 진입");

  // const q = query(
  //   collection(db, 'chatRooms'),
  //   where('participants', 'array-contains', myUid)
  // );
  // const snapshot = await getDocs(q);

  // console.log("snapshot : ",snapshot);
  
  return Promise.resolve(DUMMY_CHATS);
}

/**
 * 특정 채팅방의 메시지 목록 가져오기
 * Firebase: collection('messages').where('chatId', '==', chatId).orderBy('createdAt')
 */
export async function getMessages(chatId: string): Promise<Message[]> {
  return Promise.resolve(DUMMY_MESSAGES[chatId] ?? []);
}

/**
 * 메시지 전송
 * Firebase: collection('messages').add(message)
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string
): Promise<Message> {
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    chatId,
    senderId,
    text,
    createdAt: Date.now(),
    isRead: false,
  };
  // 더미: 메모리에만 추가 (앱 재시작 시 초기화됨)
  DUMMY_MESSAGES[chatId] = [...(DUMMY_MESSAGES[chatId] ?? []), newMessage];
  return Promise.resolve(newMessage);
}
