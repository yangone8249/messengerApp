// =============================================
// ChatListScreen - 채팅방 목록 화면
// 더미 데이터를 FlatList로 렌더링
// 채팅방 클릭 → /chat/[id] 로 이동
// =============================================

import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ChatListItem from '@/src/components/ChatListItem';
import { getChats } from '@/src/services/chatService';
import { Chat } from '@/src/types';

export default function ChatListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChats().then((data) => {
      setChats(data);
      setLoading(false);
    });
  }, []);

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
          onPress={(chat) => router.push(`/chat/${chat.id}`)}
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
