import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, RefreshControl, Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';

const StudentUpdatesScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Notice', 'Material', 'Syllabus'];

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter logic whenever posts or active filter changes
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.type === activeFilter));
    }
  }, [posts, activeFilter]);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/student/posts');
      // Filter out Homework because it has its own dedicated tab
      const feedPosts = response.data.filter(p => p.type !== 'Homework');
      setPosts(feedPosts);
    } catch (error) {
      console.log('Error fetching student posts:', error);
      // 🔥 Explicitly clear the lists so the Empty State UI shows up if fetch fails
      setPosts([]);
      setFilteredPosts([]);
      Alert.alert('Error', 'Could not load updates. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // Dynamic Icon & Color Configuration based on Post Type
  const getPostConfig = (type) => {
    switch (type) {
      case 'Notice':
        return { icon: 'bell', color: colors.primary, bg: colors.primary + '15' };
      case 'Material':
        return { icon: 'file-text', color: colors.success, bg: colors.success + '15' };
      case 'Syllabus':
        return { icon: 'book', color: colors.cardIndigo, bg: colors.cardIndigo + '15' };
      default:
        return { icon: 'file', color: colors.text.secondary, bg: colors.background };
    }
  };

  // Custom tailored card for Notices & Materials (NO "Submit" button)
  const renderPostCard = ({ item }) => {
    const config = getPostConfig(item.type);
    const postDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ViewPost', { post: item })}
      >
        <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
          <Feather name={config.icon} size={22} color={config.color} />
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <Text style={[styles.typeText, { color: config.color }]}>{item.type}</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.metaText}>{postDate}</Text>
          </View>
        </View>

        {/* Clean right arrow to indicate it's viewable, not submittable */}
        <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout title="Updates & Materials" navigation={navigation} showBack={false} showProfileIcon={false}>
      <View style={styles.container}>
        
        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <FlatList 
            data={filters}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeFilter === item && styles.activeFilterChip
                ]}
                onPress={() => setActiveFilter(item)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterText,
                  activeFilter === item && styles.activeFilterText
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10, paddingTop: 5 }}
          />
        </View>

        {/* Feed List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.cardIndigo} />
            <Text style={styles.loadingText}>Loading updates...</Text>
          </View>
        ) : (
          <FlatList 
            data={filteredPosts}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cardIndigo} />
            }
            renderItem={renderPostCard}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Feather name="bell-off" size={48} color={colors.cardIndigo} />
                </View>
                <Text style={styles.emptyTitle}>No Updates Yet</Text>
                <Text style={styles.emptyText}>
                  {activeFilter === 'All' 
                    ? "Your teachers haven't posted any notices or materials for your class recently." 
                    : `There are no posts in the ${activeFilter} category right now.`}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  filterContainer: {
    marginBottom: 10,
    marginTop: 5,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...colors.shadow,
    elevation: 2,
  },
  activeFilterChip: {
    backgroundColor: colors.cardIndigo,
    borderColor: colors.cardIndigo,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeFilterText: {
    color: colors.white,
  },
  listContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    fontSize: 14
  },
  
  // Custom Card Styles
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    padding: 16, borderRadius: 16, marginBottom: 12, ...colors.shadow
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14
  },
  cardInfo: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  typeBadge: { backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text.tertiary, marginHorizontal: 8 },
  metaText: { fontSize: 12, color: colors.text.secondary, fontWeight: '500' },

  // Empty State Styles
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 60, 
    paddingHorizontal: 40 
  },
  emptyIconBox: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: colors.cardIndigo + '15', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 20 
  },
  emptyTitle: { 
    fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 8 
  },
  emptyText: { 
    fontSize: 14, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 
  }
});

export default StudentUpdatesScreen;