// =============================================
// Root Layout - 앱 전체 네비게이션 구조
// Stack 최상위: 탭 그룹(tabs) + 채팅방(chat/[id])
// =============================================

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';

console.log("오끼야만두 실행")
export default function RootLayout() {
  return (
    

    <>
      <KeyboardProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#1a1a1a',
            headerTitleStyle: { fontWeight: '600' },
            headerBackTitle: '뒤로',
          }}
        >
          {/* 탭 그룹 (채팅 목록 + 설정) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* 채팅방 화면 - 스택으로 올라옴 */}
          <Stack.Screen
            name="chat/[id]"
            options={{
              title: '채팅',
            }}
          />
        </Stack>
      </KeyboardProvider>
      <StatusBar style="dark" />
    </>
  );
}
