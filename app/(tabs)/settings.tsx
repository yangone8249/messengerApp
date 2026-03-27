// =============================================
// SettingsScreen - 설정 화면
// 현재 로그인 유저 정보 표시
// 나중에 로그아웃, 알림 설정, 프로필 편집 등 추가 가능
// =============================================

import { useAuth } from '@/src/context/AuthContext';
import { CURRENT_USER } from '@/src/data/dummyData';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/** 설정 메뉴 한 항목 */
function SettingRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 영역 */}
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{CURRENT_USER.name[0]}</Text>
        </View>
        <Text style={styles.profileName}>{CURRENT_USER.name}</Text>
        <Text style={styles.profileId}>ID: {CURRENT_USER.id}</Text>
      </View>

      {/* 계정 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>
        <SettingRow label="프로필 편집" onPress={() => alert('프로필 편집 (미구현)')} />
        <SettingRow label="알림 설정" onPress={() => alert('알림 설정 (미구현)')} />
      </View>

      {/* 앱 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <SettingRow label="버전" value="1.0.0" />
        <SettingRow label="개인정보 처리방침" onPress={() => alert('(미구현)')} />
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profile: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  profileId: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#aaa',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  rowValue: {
    fontSize: 14,
    color: '#aaa',
    marginRight: 6,
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
  logoutBtn: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: '600',
  },
});
