// =============================================
// 앱 전체에서 사용하는 타입 정의
// 나중에 Firebase 연동 시 이 타입을 그대로 유지하면 됨
// =============================================

/** 유저 정보 */
export interface User {
  id: string;
  name: string;
  avatar?: string; // 프로필 이미지 URL (선택)
  isOnline?: boolean;
}

/** 단일 메시지 */
export interface Message {
  id: string;
  chatId: string;       // 어느 채팅방에 속하는지
  senderId: string;     // 보낸 사람 ID
  senderName: string;     // 보낸 사람 Name
  text: string;
  createdAt: number;    // timestamp (ms)
  isRead?: boolean;
}

export type ChatType = 'self' | 'direct' | 'group';

/** 채팅방 */
export interface Chat {
  id: string;
  type: ChatType;
  participants: User[];
  lastMessage?: string;
  unreadCounts: Record<string, number>;
  unreadCount: number;
  updatedAt: number;
}
