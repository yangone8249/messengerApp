import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  console.log("login : "+ login);

  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!id.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    // 나중에 Firebase/서버 인증으로 교체
    // 지금은 더미: 아무 값이나 입력하면 로그인
    login(id.trim());
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
      >
        {/* 상단 타이틀 */}
        <View style={styles.header}>
          <Text style={styles.appName}>Messenger</Text>
          <Text style={styles.subtitle}>계속하려면 로그인하세요</Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={id}
              onChangeText={setID}
              placeholder="example@email.com"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호 입력"
              placeholderTextColor="#bbb"
              secureTextEntry
            />
          </View>

          {/* 에러 메시지 */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* 로그인 버튼 */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  appName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  error: {
    fontSize: 12,
    color: '#e53935',
    marginTop: -4,
  },
  loginBtn: {
    height: 50,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
