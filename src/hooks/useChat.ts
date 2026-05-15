// =============================================
// useChat 커스텀 훅
//
// 채팅방 화면에서 메시지 로드 & 전송 로직을 담당
// 화면 컴포넌트는 이 훅만 사용 → UI와 비즈니스 로직 분리
// =============================================

import { useCallback, useEffect, useState } from 'react';
import { sendFileMessage, sendMessage, subscribeMessages } from '../services/chatService';
import { Message } from '../types';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  send: (text: string) => Promise<void>;
  sendFile: (fileUri: string, fileType: 'image' | 'file', fileName: string) => Promise<void>;
}

export function useChat(chatId: string, myUid: string, myName: string): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // // [기존] 1회성 메시지 로드 (getDocs)
  // useEffect(() => {
  //   let cancelled = false;
  //   setIsLoading(true);
  //   getMessages(chatId).then((msgs) => {
  //     if (!cancelled) {
  //       setMessages(msgs);
  //       setIsLoading(false);
  //     }
  //   });
  //   return () => { cancelled = true; };
  // }, [chatId]);

  // [신규] 실시간 메시지 구독 (onSnapshot)
  // 메시지 추가될 때마다 자동 갱신, 채팅방 나갈 때 구독 자동 해제
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeMessages(chatId, (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [chatId]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    await sendMessage(chatId, myUid, myName, text.trim());
  }, [chatId, myUid, myName]);

  const sendFile = useCallback(async (fileUri: string, fileType: 'image' | 'file', fileName: string) => {
    console.log("fileUri : ",fileUri)
    console.log("fileType : ",fileType)
    console.log("fileName : ",fileName)

    await sendFileMessage(chatId, myUid, myName, fileUri, fileType, fileName);
  }, [chatId, myUid, myName]);

  return { messages, isLoading, send, sendFile };
}
