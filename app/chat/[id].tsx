import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MessageItem from '@/src/components/MessageItem';
import { useAuth } from '@/src/context/AuthContext';
import { useChat } from '@/src/hooks/useChat';
import { markAsRead } from '@/src/services/chatService';
import { getUser } from '@/src/services/userService';
import { Message } from '@/src/types';

type PendingMessage = Message & { uploading: true; localUri: string };

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    zip: 'application/zip',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
  };
  return ext ? (map[ext] ?? 'application/octet-stream') : 'application/octet-stream';
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const myUid = user?.uid ?? '';
  const [myName, setMyName] = useState('');
  const { messages, isLoading, send, sendFile } = useChat(id, myUid, myName);
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    console.log("방 ID : "+id)
    console.log("채팅 ID : ",messages[messages.length-1]?.id)
    if (myUid && id) markAsRead(id, myUid);
  }, [id, myUid]);

  useEffect(() => {
    if (user?.uid) {
      getUser(user.uid).then(profile => {
        setMyName(profile?.name ?? user.email ?? '');
      });
    }
  }, [user?.uid]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    const text = inputText;
    setInputText('');
    await send(text);
  };

  const handlePickImage = async () => {
    console.log("이미지 업로드 진입")
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("status : ",status)
    if (status !== 'granted') {
      Alert.alert('권한 필요', '이미지 전송을 위해 갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const fileName = asset.uri.split('/').pop() ?? 'image.jpg';

    const tempId = `temp_${Date.now()}`;
    setPendingMessages(prev => [...prev, {
      id: tempId,
      chatId: id,
      senderId: myUid,
      senderName: myName,
      text: '',
      createdAt: Date.now(),
      fileType: 'image',
      fileName,
      uploading: true,
      localUri: asset.uri,
    }]);
    setUploading(true);

    try {
      console.log("asset.uri : ",asset.uri)
      console.log("fileName : ",fileName)
      await sendFile(asset.uri, 'image', fileName);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e) {
      Alert.alert('오류', '이미지 전송에 실패했습니다.');
    } finally {
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
      setUploading(false);
    }
  };

  const handlePickFile = async () => {
    console.log("파일 업로드 진입")
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    console.log("result",result)
    if (result.canceled) return;
    const asset = result.assets[0];

    const tempId = `temp_${Date.now()}`;
    setPendingMessages(prev => [...prev, {
      id: tempId,
      chatId: id,
      senderId: myUid,
      senderName: myName,
      text: '',
      createdAt: Date.now(),
      fileType: 'file',
      fileName: asset.name,
      uploading: true,
      localUri: asset.uri,
    }]);
    setUploading(true);

    try {
      console.log("asset",asset)
      await sendFile(asset.uri, 'file', asset.name);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e) {
      Alert.alert('오류', '파일 전송에 실패했습니다.');
    } finally {
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
      setUploading(false);
    }
  };

  const handleDownload = async (msg: Message) => {
    if (!msg.fileUrl || !msg.fileName || downloadingId === msg.id) return;
    setDownloadingId(msg.id);
    try {
      if (msg.fileType === 'image') {
        const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
        if (status !== 'granted') {
          Alert.alert('권한 필요', '이미지 저장을 위해 미디어 라이브러리 권한이 필요합니다.');
          return;
        }
        const localUri = (FileSystem.cacheDirectory ?? '') + msg.fileName;
        await FileSystem.downloadAsync(msg.fileUrl, localUri);
        await MediaLibrary.saveToLibraryAsync(localUri);
        Alert.alert('저장 완료', '갤러리에 저장됐습니다.');
      } else {
        const localUri = (FileSystem.cacheDirectory ?? '') + `${Date.now()}_${msg.fileName}`;
        await FileSystem.downloadAsync(msg.fileUrl, localUri);

        let directoryUri = await AsyncStorage.getItem('downloadDirectoryUri');
        if (!directoryUri) {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permissions.granted) {
            Alert.alert('권한 필요', '파일 저장을 위해 폴더 접근 권한이 필요합니다.');
            return;
          }
          directoryUri = permissions.directoryUri;
          await AsyncStorage.setItem('downloadDirectoryUri', directoryUri);
        }

        const base64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          msg.fileName,
          getMimeType(msg.fileName)
        );
        await FileSystem.writeAsStringAsync(newUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert('다운로드 완료', '파일이 저장됐습니다.');
      }
    } catch (e) {
      console.log(e)
      Alert.alert('오류', '다운로드에 실패했습니다.');
    } finally {
      setDownloadingId(null);
    }
  };

  const renderMessage = ({ item }: { item: Message | PendingMessage }) => {
    const isMe = item.senderId === myUid;
    const isPending = (item as PendingMessage).uploading;

    if (isPending) {
      const pending = item as PendingMessage;
      if (pending.fileType === 'image') {
        return (
          <View style={[styles.msgRow, styles.msgRowMe]}>
            <View>
              <Image source={{ uri: pending.localUri }} style={[styles.imageMsg, { opacity: 0.5 }]} resizeMode="cover" />
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            </View>
          </View>
        );
      }
      return (
        <View style={[styles.msgRow, styles.msgRowMe]}>
          <View style={[styles.fileBubble, styles.bubbleMe]}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={[styles.fileName, styles.textMe]} numberOfLines={1}>{pending.fileName}</Text>
          </View>
        </View>
      );
    }

    if (item.fileType === 'image' && item.fileUrl) {
      const isDownloading = downloadingId === item.id;
      return (
        <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
          {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
          <TouchableOpacity onPress={() => setPreviewImage(item.fileUrl!)}>
            <Image source={{ uri: item.fileUrl }} style={styles.imageMsg} resizeMode="cover" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDownload(item)}
            style={[styles.downloadBtn, isDownloading && styles.downloadBtnLoading]}
            disabled={isDownloading}
          >
            {isDownloading
              ? <ActivityIndicator size="small" color="#4A90D9" />
              : <Text style={styles.downloadText}>⬇ 저장</Text>
            }
          </TouchableOpacity>
        </View>
      );
    }

    if (item.fileType === 'file' && item.fileUrl) {
      const isDownloading = downloadingId === item.id;
      return (
        <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
          {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
          <View style={[styles.fileBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={[styles.fileIcon]}>📎</Text>
            <Text style={[styles.fileName, isMe && styles.textMe]} numberOfLines={1}>{item.fileName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDownload(item)}
            style={[styles.downloadBtn, isDownloading && styles.downloadBtnLoading]}
            disabled={isDownloading}
          >
            {isDownloading
              ? <ActivityIndicator size="small" color="#4A90D9" />
              : <Text style={styles.downloadText}>⬇ 다운로드</Text>
            }
          </TouchableOpacity>
        </View>
      );
    }

    return <MessageItem message={item} myUid={myUid} />;
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={30}
    >
      <FlatList
        ref={flatListRef}
        data={[...[...messages].reverse(), ...pendingMessages]}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        inverted
      />

      <View style={[styles.inputBar, { paddingBottom: 16 + bottom }]}>
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage} disabled={uploading}>
          <Text style={styles.attachIcon}>🖼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickFile} disabled={uploading}>
          <Text style={styles.attachIcon}>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={uploading ? '업로드 중...' : '메시지 입력...'}
          placeholderTextColor="#aaa"
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!uploading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || uploading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || uploading}
        >
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPreviewImage(null)}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {previewImage && (
            <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: { paddingVertical: 12 },
  msgRow: { marginHorizontal: 12, marginVertical: 4, maxWidth: '75%' },
  msgRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  msgRowOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 11, color: '#888', marginBottom: 2, marginLeft: 4 },
  imageMsg: { width: 200, height: 200, borderRadius: 12 },
  uploadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  fileBubble: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 6, maxWidth: 220 },
  bubbleMe: { backgroundColor: '#4A90D9' },
  bubbleOther: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0' },
  fileIcon: { fontSize: 18 },
  fileName: { flex: 1, fontSize: 13, color: '#1a1a1a' },
  textMe: { color: '#fff' },
  downloadBtn: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#e8f0fb', borderRadius: 8, alignSelf: 'flex-end', minWidth: 70, alignItems: 'center' },
  downloadBtnLoading: { backgroundColor: '#f0f0f0' },
  downloadText: { fontSize: 11, color: '#4A90D9', fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8, paddingTop: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  attachBtn: { padding: 6, justifyContent: 'center', alignItems: 'center' },
  attachIcon: { fontSize: 22 },
  input: { flex: 1, minHeight: 38, maxHeight: 100, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, color: '#1a1a1a', marginHorizontal: 6 },
  sendBtn: { backgroundColor: '#4A90D9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  sendBtnDisabled: { backgroundColor: '#c0d9f0' },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 1, padding: 10 },
  modalCloseText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  previewImage: { width: '100%', height: '80%' },
});
