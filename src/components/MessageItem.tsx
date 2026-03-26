// =============================================
// MessageItem 컴포넌트
// 채팅방에서 메시지 말풍선 하나를 표시
// 내 메시지(오른쪽) vs 상대 메시지(왼쪽) 구분
// =============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { CURRENT_USER } from '../data/dummyData';

interface Props {
  message: Message;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function MessageItem({ message }: Props) {
  const isMe = message.senderId === CURRENT_USER.id;

  return (
    <View style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}>
      {/* 내 메시지: 파란 말풍선 오른쪽 / 상대: 회색 말풍선 왼쪽 */}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.text, isMe ? styles.textMe : styles.textOther]}>
          {message.text}
        </Text>
      </View>
      <Text style={[styles.time, isMe ? styles.timeRight : styles.timeLeft]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 3,
    paddingHorizontal: 12,
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: '#4A90D9',
    borderBottomRightRadius: 4,
    // 내 말풍선: 오른쪽 아래 모서리 작게
  },
  bubbleOther: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
    // 상대 말풍선: 왼쪽 아래 모서리 작게
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  textMe: {
    color: '#fff',
  },
  textOther: {
    color: '#1a1a1a',
  },
  time: {
    fontSize: 10,
    color: '#aaa',
    marginBottom: 2,
  },
  timeRight: {
    marginRight: 6,
    // 내 메시지: 말풍선 왼쪽에 시간 표시
    order: -1, // React Native에서 order 미지원 → flexDirection으로 처리
  },
  timeLeft: {
    marginLeft: 6,
  },
});
