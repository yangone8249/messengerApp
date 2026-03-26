// =============================================
// 하단 탭 네비게이터 레이아웃
// 탭 2개: 채팅 목록(index) + 설정(settings)
// =============================================

import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';


export default function TabLayout() {
    const { user } = useAuth();

  // 로그인 안 됐으면 로그인 화면으로
  if (!user) return <Redirect href="/auth/login" />;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4A90D9',
        tabBarInactiveTintColor: '#aaa',
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#1a1a1a',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#f0f0f0' },
      }}
    >
      {/* 채팅 목록 탭 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '채팅',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 설정 탭 */}
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
