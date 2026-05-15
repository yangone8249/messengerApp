// =============================================
// ChatListScreen - 채팅방 목록 화면
// 더미 데이터를 FlatList로 렌더링
// 채팅방 클릭 → /chat/[id] 로 이동
// =============================================

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import ChatListItem from '@/src/components/ChatListItem';
import { useAuth } from '@/src/context/AuthContext';
import { leaveChat, subscribeChats } from '@/src/services/chatService';
import { Chat } from '@/src/types';

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // 실시간 채팅방 목록 구독
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const unsubscribe = subscribeChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>채팅이 없습니다</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ChatListItem
          chat={item}
          myUid={user?.uid ?? ''}
          onPress={(chat) => router.push(`/chat/${chat.id}`)}
          onDelete={async (chatId) => {
            await leaveChat(chatId, user?.uid ?? '');
            setChats(prev => prev.filter(c => c.id !== chatId));
          }}
        />
      )}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  empty: {
    color: '#aaa',
    fontSize: 15,
  },
});
