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
      // Filter only Homework types if you want
      const homeworks = response.data.filter(p => p.type === 'Homework');
      setPosts(homeworks);
      setLoading(false);
    } catch (error) {
        console.log('Error fetching homework posts:', error);
      Alert.alert('Error', 'Could not fetch homework list.');
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => Alert.alert("Coming Soon", "Submission View Screen is next!")}>
      <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
        <Feather name="book" size={24} color={colors.secondary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>Class: {item.targetClass} • {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.badge}>
         <Text style={styles.badgeText}>View</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainLayout title="Homework Status" navigation={navigation} showBack={true}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList 
            data={posts}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No homework posted yet.</Text>}
          />
        )}
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    padding: 15, borderRadius: 12, marginBottom: 12, ...colors.shadow
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: colors.text.primary },
  sub: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  badge: { backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: colors.text.primary },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.text.secondary }
});

export default CheckHomeworkScreen;