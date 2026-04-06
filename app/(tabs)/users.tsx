import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { openChatRoom } from '@/src/services/chatService';
import { UserProfile, getUsers, searchUsersByName } from '@/src/services/userService';

import { useAuth } from '@/src/context/AuthContext';

export default function UsersScreen() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersNotLoad, setUsersNotLoad] = useState<UserProfile[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userArr, setUserArr] = useState<String[]>([]);

  // ✅ 훅은 컴포넌트 최상단에서 한 번만 호출
  // 함수 안에서 호출하면 React가 렌더링 순서를 추적 못해서 버그 발생
  const { user } = useAuth();
  
  // 최초 전체 유저 목록 로드
  useEffect(() => {
    getUsers().then((data) => {
      console.log("data 결과 : ",data);
      let tempArr = data.map(a=>a.name);
      
      setUserArr(tempArr);
      console.log("userArr : ",userArr);
      setUsersNotLoad(data);
      setIsLoading(false);
    });
  }, []);

  // 이름 검색
  const handleSearch = async () => {
    console.log("검색 keyword : "+keyword);
    if (!keyword.trim()) {
      // 검색어 없으면 전체 목록
      const data = await getUsers();
      console.log("검색어 없으면 전체 목록");
      console.log("getUsers() 결과 : ",data);
      setUsers(data);
      return;
    }
    setIsLoading(true);
    const data = await searchUsersByName(keyword.trim());
    console.log("검색 결과 data : "+data);
    
    setUsers(data);
    setIsLoading(false);
  };

 // 채팅방 개설 후 채팅하기
  // user는 컴포넌트 최상단에서 꺼낸 값 → 함수 안에서 그냥 참조만
  const makeChatRoom = async (targetUid: string) => {
    if (!user?.uid) {
      console.log('로그인 정보가 없습니다.');
      return;
    }
    console.log("myUid : ", user.uid);
    console.log("targetUid : ", targetUid);
    const roomId = await openChatRoom(user.uid, targetUid);
    console.log("roomId : ", roomId);
  };

  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.item}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.[0] ?? '?'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <TouchableOpacity style={styles.chatBtn}  onPress={() => makeChatRoom(item.uid)} activeOpacity={0.8}>
        <Text style={styles.chatBtnText}>채팅하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* 검색바 */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={keyword}
          // onChangeText={setKeyword}
          onChangeText={(text) => {
            setKeyword(text);
            console.log("검색어 : "+text);
            const names = userArr.filter(name => 
              name.toLowerCase().startsWith(text.toLowerCase()) && text.trim() !== ''
            );

            console.log("names : ",names);
            console.log("users : ",users);
            let result = usersNotLoad.filter(name => names.includes(name.name))
            
            console.log(result);
            setUsers(result);


          }}
          placeholder="이름으로 검색"
          placeholderTextColor="#bbb"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4A90D9" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.empty}>유저가 없습니다.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  searchBtn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#4A90D9',
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  email: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 72,
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#aaa',
    fontSize: 14,
  },
  chatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4A90D9',
    borderRadius: 8,
  },
  chatBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});