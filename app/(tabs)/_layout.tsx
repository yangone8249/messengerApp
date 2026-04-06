// =============================================
// 하단 탭 네비게이터 레이아웃
// 탭 2개: 채팅 목록(index) + 설정(settings)
// =============================================

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';


export default function TabLayout() {
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

      {/* 유저 목록 탭 */}
      <Tabs.Screen
        name="users"
        options={{
          title: '유저',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
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
