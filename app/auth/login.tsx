import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

export default function LoginScreen() {
  const router = useRouter();

  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async () => {
    setError('');
    if (!id.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await AsyncStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
      const auth = getAuth(app);
      const loginData = await signInWithEmailAndPassword(auth, id.trim(), password);
    } catch (e: any) {
      switch (e.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
          break;
        case 'auth/invalid-email':
          setError('이메일 형식이 올바르지 않습니다.');
          break;
        case 'auth/too-many-requests':
          setError('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.');
          break;
        default:
          setError(e.code + ': ' + e.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.header}>
          <Text style={styles.appName}>Messenger</Text>
          <Text style={styles.subtitle}>계속하려면 로그인하세요</Text>
        </View>

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

          {/* 로그인 상태 유지 체크박스 */}
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => {setRememberMe(!rememberMe);
              console.log(rememberMe);
            }
            }
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>로그인 상태 유지</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginText}>로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/register')} activeOpacity={0.7}>
            <Text style={styles.registerLink}>계정이 없으신가요? <Text style={styles.registerLinkBold}>회원가입</Text></Text>
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: 13,
    color: '#555',
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
  registerLink: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  registerLinkBold: {
    color: '#4A90D9',
    fontWeight: '600',
  },
});
