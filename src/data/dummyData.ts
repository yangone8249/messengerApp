// =============================================
// 더미 데이터 - 실제 서버/Firebase 연동 전 개발용
// 나중에 chatService.ts에서 API 호출로 교체하면 됨
// =============================================

import { User, Chat, Message } from '../types';

/** 현재 로그인한 유저 (나) */
export const CURRENT_USER: User = {
  id: 'me',
  name: '나',
  isOnline: true,
};

/** 더미 유저 목록 */
export const DUMMY_USERS: User[] = [
  { id: 'user1', name: '김철수', isOnline: true },
  { id: 'user2', name: '이영희', isOnline: false },
  { id: 'user3', name: '박민수', isOnline: true },
  { id: 'user4', name: '최지은', isOnline: false },
];

/** 더미 채팅방 목록 */
export const DUMMY_CHATS: Chat[] = [
  {
    id: 'chat1',
    participants: [CURRENT_USER, DUMMY_USERS[0]],
    lastMessage: {
      id: 'msg_last1',
      chatId: 'chat1',
      senderId: 'user1',
      text: '안녕하세요! 잘 지내시나요?',
      createdAt: Date.now() - 1000 * 60 * 5, // 5분 전
    },
    unreadCount: 2,
    updatedAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'chat2',
    participants: [CURRENT_USER, DUMMY_USERS[1]],
    lastMessage: {
      id: 'msg_last2',
      chatId: 'chat2',
      senderId: 'me',
      text: '내일 미팅 몇 시예요?',
      createdAt: Date.now() - 1000 * 60 * 30,
    },
    unreadCount: 0,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'chat3',
    participants: [CURRENT_USER, DUMMY_USERS[2]],
    lastMessage: {
      id: 'msg_last3',
      chatId: 'chat3',
      senderId: 'user3',
      text: '프로젝트 잘 되고 있어요!',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    unreadCount: 1,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'chat4',
    participants: [CURRENT_USER, DUMMY_USERS[3]],
    lastMessage: {
      id: 'msg_last4',
      chatId: 'chat4',
      senderId: 'user4',
      text: '감사합니다 :)',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    unreadCount: 0,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];

/** 채팅방별 더미 메시지 목록 */
export const DUMMY_MESSAGES: Record<string, Message[]> = {
  chat1: [
    { id: 'm1', chatId: 'chat1', senderId: 'user1', text: '안녕하세요!', createdAt: Date.now() - 1000 * 60 * 10 },
    { id: 'm2', chatId: 'chat1', senderId: 'me', text: '안녕하세요~ 반갑습니다', createdAt: Date.now() - 1000 * 60 * 9 },
    { id: 'm3', chatId: 'chat1', senderId: 'user1', text: '요즘 어떻게 지내세요?', createdAt: Date.now() - 1000 * 60 * 7 },
    { id: 'm4', chatId: 'chat1', senderId: 'me', text: '잘 지내고 있어요!', createdAt: Date.now() - 1000 * 60 * 6 },
    { id: 'm5', chatId: 'chat1', senderId: 'user1', text: '안녕하세요! 잘 지내시나요?', createdAt: Date.now() - 1000 * 60 * 5 },
  ],
  chat2: [
    { id: 'm6', chatId: 'chat2', senderId: 'user2', text: '내일 시간 되세요?', createdAt: Date.now() - 1000 * 60 * 40 },
    { id: 'm7', chatId: 'chat2', senderId: 'me', text: '네 가능해요', createdAt: Date.now() - 1000 * 60 * 35 },
    { id: 'm8', chatId: 'chat2', senderId: 'me', text: '내일 미팅 몇 시예요?', createdAt: Date.now() - 1000 * 60 * 30 },
  ],
  chat3: [
    { id: 'm9', chatId: 'chat3', senderId: 'me', text: '진행상황 어때요?', createdAt: Date.now() - 1000 * 60 * 60 * 3 },
    { id: 'm10', chatId: 'chat3', senderId: 'user3', text: '프로젝트 잘 되고 있어요!', createdAt: Date.now() - 1000 * 60 * 60 * 2 },
  ],
  chat4: [
    { id: 'm11', chatId: 'chat4', senderId: 'me', text: '도움이 됐으면 좋겠어요', createdAt: Date.now() - 1000 * 60 * 60 * 25 },
    { id: 'm12', chatId: 'chat4', senderId: 'user4', text: '감사합니다 :)', createdAt: Date.now() - 1000 * 60 * 60 * 24 },
  ],
};
