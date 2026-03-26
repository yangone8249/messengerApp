// =============================================
// ChatRoomScreen - 채팅방 화면
// URL: /chat/:id
// useChat 훅으로 메시지 로드 & 전송
// =============================================

import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MessageItem from '@/src/components/MessageItem';
import { CURRENT_USER, DUMMY_CHATS } from '@/src/data/dummyData';
import { useChat } from '@/src/hooks/useChat';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';



console.log("채팅방 진입")
export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { messages, isLoading, send } = useChat(id);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  // 안드로이드 하단 네비게이션 바 높이
  const { bottom } = useSafeAreaInsets();


  // 헤더 타이틀을 상대방 이름으로 설정
  React.useLayoutEffect(() => {
    const chat = DUMMY_CHATS.find((c) => c.id === id);
    const other = chat?.participants.find((u) => u.id !== CURRENT_USER.id);
    navigation.setOptions({ title: other?.name ?? '채팅' });
  }, [id, navigation]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await send(text);
    // 전송 후 최하단으로 스크롤
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }
  return (
    // KeyboardAvoidingView: 키보드 올라올 때 입력창이 가려지지 않도록
    // KeyboardAvoidingView 대신 그냥 View로 교체
    <KeyboardAvoidingView 
      style={styles.container}
      behavior="padding"
  keyboardVerticalOffset={30}
    >

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputBar, { paddingBottom: 16 + bottom }]}>

        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지 입력..."
          placeholderTextColor="#aaa"
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingVertical: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,          // paddingVertical: 8 을 이렇게 분리
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    // paddingBottom은 인라인에서만 제어
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1a1a1a',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#4A90D9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  sendBtnDisabled: {
    backgroundColor: '#c0d9f0',
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
