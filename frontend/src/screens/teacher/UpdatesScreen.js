import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';

const UpdatesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('My Posts'); // 'My Posts' or 'School Notices'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      // We will adjust this API slightly on the backend next!
      const res = await api.get('/teacher/posts'); 
      setPosts(res.data);
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // Filter posts based on the active tab
  // (Note: We will need to tweak the backend so it actually returns School Notices to teachers)
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'My Posts') {
      return true; // For now, assuming the API returns ONLY my posts
    } else {
      return post.type === 'Notice'; 
    }
  });

  const renderPostCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '15' }]}>
            <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
              {item.type}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('en-GB')}
          </Text>
        </View>
        <Text style={styles.postTitle}>{item.title}</Text>
      </View>
      
      <Text style={styles.postDesc} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.targetClassBadge}>
          <Feather name="users" size={14} color={colors.text.secondary} />
          <Text style={styles.targetClassText}>Class {item.targetClass}</Text>
        </View>

        {item.attachmentUrl && (
          <View style={styles.attachmentBadge}>
            <Feather name="paperclip" size={14} color={colors.primary} />
            <Text style={styles.attachmentText}>Attached</Text>
          </View>
        )}
      </View>
    </View>
  );

  const getTypeColor = (type) => {
    if (type === 'Homework') return colors.warning; // e.g., Orange
    if (type === 'Material') return colors.success; // e.g., Green
    return colors.primary; // Notice = Blue
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Updates</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('PostNotice')}
        >
          <Feather name="plus" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Top Toggle Bar */}
      <View style={styles.toggleContainerWrapper}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, activeTab === 'My Posts' && styles.activeToggle]}
            onPress={() => setActiveTab('My Posts')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, activeTab === 'My Posts' && styles.activeToggleText]}>
              My Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, activeTab === 'School Notices' && styles.activeToggle]}
            onPress={() => setActiveTab('School Notices')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, activeTab === 'School Notices' && styles.activeToggleText]}>
              School Notices
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Post List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.centerBox}>
          <Feather name="inbox" size={48} color={colors.text.tertiary} style={{ opacity: 0.5 }} />
          <Text style={styles.emptyText}>No posts found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item._id}
          renderItem={renderPostCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadow,
  },
  toggleContainerWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    ...colors.cardShadow,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeToggle: {
    backgroundColor: colors.background,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeToggleText: {
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100, // Extra padding for bottom bar
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...colors.cardShadow,
  },
  cardHeader: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  postDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  targetClassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  targetClassText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  attachmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.tertiary,
    fontWeight: '500',
  }
});

export default UpdatesScreen;