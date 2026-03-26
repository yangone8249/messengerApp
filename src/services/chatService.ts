// =============================================
// Chat Service - 데이터 접근 추상화 레이어
//
// 현재: 더미 데이터 반환
// 나중에 Firebase/서버 연동 시 이 파일만 수정하면 됨
// 화면 컴포넌트(screens)는 이 서비스만 바라보므로
// 내부 구현이 바뀌어도 화면 코드는 변경 불필요
// =============================================

import { Chat, Message } from '../types';
import { DUMMY_CHATS, DUMMY_MESSAGES } from '../data/dummyData';

/**
 * 채팅방 목록 가져오기
 * Firebase: collection('chats').where('participants', 'array-contains', userId)
 */
export async function getChats(): Promise<Chat[]> {
  // 더미: 바로 반환
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
