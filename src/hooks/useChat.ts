// =============================================
// useChat 커스텀 훅
//
// 채팅방 화면에서 메시지 로드 & 전송 로직을 담당
// 화면 컴포넌트는 이 훅만 사용 → UI와 비즈니스 로직 분리
// =============================================

import { useCallback, useEffect, useState } from 'react';
import { CURRENT_USER } from '../data/dummyData';
import { getMessages, sendMessage } from '../services/chatService';
import { Message } from '../types';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  send: (text: string) => Promise<void>;
}

export function useChat(chatId: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 메시지 초기 로드
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getMessages(chatId).then((msgs) => {
      if (!cancelled) {
        setMessages(msgs);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
    // Firebase 사용 시: onSnapshot 리스너로 교체하여 실시간 업데이트 가능
  }, [chatId]);

  // 메시지 전송
  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const newMsg = await sendMessage(chatId, CURRENT_USER.id, text.trim());
    setMessages((prev) => [...prev, newMsg]);
  }, [chatId]);

  return { messages, isLoading, send };
}
