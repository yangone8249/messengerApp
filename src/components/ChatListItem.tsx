// =============================================
// ChatListItem 컴포넌트
// 채팅 목록 화면에서 각 채팅방 한 줄을 표시
// Chat 타입 데이터를 받아 렌더링
// =============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Chat } from '../types';
import { CURRENT_USER } from '../data/dummyData';

interface Props {
  chat: Chat;
  onPress: (chat: Chat) => void;
}

/** ms 단위 timestamp → 표시용 시간 문자열 */
function formatTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / 60000)}분 전`;
  if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / 3600000)}시간 전`;
  return `${Math.floor(diff / 86400000)}일 전`;
}

export default function ChatListItem({ chat, onPress }: Props) {
  // 나를 제외한 상대방 이름
  const other = chat.participants.find((u) => u.id !== CURRENT_USER.id);
  const name = other?.name ?? '알 수 없음';
  const lastText = chat.lastMessage?.text ?? '';
  const timeStr = chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : '';

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(chat)} activeOpacity={0.7}>
      {/* 아바타 자리 (텍스트 이니셜) */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name[0]}</Text>
      </View>

      {/* 중앙: 이름 + 마지막 메시지 */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{lastText}</Text>
      </View>

      {/* 우측: 시간 + 안읽은 수 */}
      <View style={styles.meta}>
        <Text style={styles.time}>{timeStr}</Text>
        {chat.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{chat.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
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
});
