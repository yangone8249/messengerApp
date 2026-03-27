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
import app from '@/src/services/firebase';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!email.trim() || !password.trim() || !passwordConfirm.trim()) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      login(userCredential.user.email!);
    } catch (e: any) {
      switch (e.code) {
        case 'auth/email-already-in-use':
          setError('이미 사용 중인 이메일입니다.');
          break;
        case 'auth/invalid-email':
          setError('이메일 형식이 올바르지 않습니다.');
          break;
        case 'auth/weak-password':
          setError('비밀번호가 너무 약합니다. 6자 이상 입력해주세요.');
          break;
        default:
          setError('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.header}>
          <Text style={styles.appName}>회원가입</Text>
          <Text style={styles.subtitle}>새 계정을 만들어보세요</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
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
              placeholder="6자 이상 입력"
              placeholderTextColor="#bbb"
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="비밀번호 재입력"
              placeholderTextColor="#bbb"
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.registerText}>가입하기</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.loginLink}>이미 계정이 있으신가요? <Text style={styles.loginLinkBold}>로그인</Text></Text>
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
  registerBtn: {
    height: 50,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  loginLinkBold: {
    color: '#4A90D9',
    fontWeight: '600',
  },
});