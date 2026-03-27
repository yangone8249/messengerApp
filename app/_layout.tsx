import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { AuthProvider } from '@/src/context/AuthContext';
import { useAuth } from '@/src/context/AuthContext';
import { usePathname } from 'expo-router';

// AuthProvider 안에서 useAuth()를 써야 하므로 별도 컴포넌트로 분리
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Firebase 상태 확인 중 → 로딩 화면
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  const isAuthPage = pathname.startsWith('/auth');

  // 로그인 안 됨 + 인증 페이지 아님 → 로그인으로 강제 이동
  if (!user && !isAuthPage) {
    return <Redirect href="/auth/login" />;
  }

  // 로그인 됨 + 인증 페이지 → 탭으로 강제 이동
  if (user && isAuthPage) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <KeyboardProvider>
        <AuthGuard>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: '#1a1a1a',
              headerTitleStyle: { fontWeight: '600' },
              headerBackTitle: '뒤로',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="chat/[id]" options={{ title: '채팅' }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          </Stack>
        </AuthGuard>
      </KeyboardProvider>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
