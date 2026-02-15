import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import MainLayout from '../../components/MainLayout';

const CheckHomeworkScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/teacher/posts');
      // Filter only Homework types
      const homeworks = response.data.filter(p => p.type === 'Homework');
      setPosts(homeworks);
    } catch (error) {
      console.log('Error fetching homework posts:', error);
      Alert.alert('Error', 'Could not fetch homework list.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      // FIX: Navigate to the new screen and pass the homework data
      onPress={() => navigation.navigate('HomeworkSubmissions', { post: item })}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
        <Feather name="book-open" size={24} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.sub}>
          Class {item.targetClass} • {new Date(item.createdAt).toLocaleDateString('en-GB')}
        </Text>
      </View>
      <View style={styles.badge}>
         <Text style={styles.badgeText}>View</Text>
         <Feather name="chevron-right" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <MainLayout title="Check Homework" navigation={navigation} showBack={true} showProfileIcon={false}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList 
            data={posts}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="inbox" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>No homework posted yet.</Text>
              </View>
            }
          />
        )}
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    // flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    // padding: 16, borderRadius: 16, marginBottom: 16, ...colors.shadow
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
        padding: 20, borderRadius: 16, marginVertical: 6, ...colors.shadow, marginHorizontal: 5
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  info: { flex: 1, paddingRight: 10 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  sub: { fontSize: 13, color: colors.text.secondary, fontWeight: '500' },
  badge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 
  },
  badgeText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: colors.text.secondary, fontWeight: '500' }
});

export default CheckHomeworkScreen;