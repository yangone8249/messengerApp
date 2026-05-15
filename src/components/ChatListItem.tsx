// =============================================
// ChatListItem 컴포넌트
// 채팅 목록 화면에서 각 채팅방 한 줄을 표시
// Chat 타입 데이터를 받아 렌더링
// =============================================

import { useAuth } from '@/src/context/AuthContext';
import React, { useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Chat } from '../types';

interface Props {
  chat: Chat;
  myUid: string;
  onPress: (chat: Chat) => void;
  onDelete: (chatId: string) => void;
}

/** Firestore Timestamp or ms → 오늘이면 HH:mm, 지난 날이면 M월 D일 */
function formatTime(value: any): string {
  const ms = value?.seconds ? value.seconds * 1000 : Number(value);
  if (isNaN(ms)) return '';

  const d = new Date(ms);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isToday) {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ChatListItem({ chat, myUid, onPress, onDelete }: Props) {
  const swipeableRef = useRef<Swipeable>(null);
  const auth = useAuth();
  const other = chat.participants.find((u) => u.id !== myUid);
  const name = chat.type === 'self'
    ? `나와의 채팅 (${auth.user?.displayName ?? ''})`
    : (other?.name ?? '알 수 없음');
  const lastText = chat.lastMessage ?? '';
  const timeStr = chat.updatedAt ? formatTime(chat.updatedAt) : '';

  const handleDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(
      '채팅방 삭제',
      '채팅방을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => onDelete(chat.id) },
      ]
    );
  };

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
      <Text style={styles.deleteBtnText}>삭제</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      <TouchableOpacity style={styles.container} onPress={() => onPress(chat)} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name[0]}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>{lastText}</Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.time}>{timeStr}</Text>
          {(chat.unreadCounts?.[myUid] ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unreadCounts[myUid]}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 13,
    color: '#888',
  },
  meta: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  time: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
