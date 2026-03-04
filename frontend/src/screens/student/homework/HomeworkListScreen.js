import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, RefreshControl, Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';

const HomeworkListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'submitted'
  const [pendingHomework, setPendingHomework] = useState([]);
  const [submittedHomework, setSubmittedHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHomeworkData();
  }, []);

  const fetchHomeworkData = async () => {
    try {
      // Fetching real data from the backend
      const response = await api.get('/student/homework');
      setPendingHomework(response.data.pending || []);
      setSubmittedHomework(response.data.submitted || []);
    } catch (error) {
      console.log('Error fetching student homework:', error);
      // 🔥 REMOVED DUMMY DATA. Setting to empty arrays so the Empty State UI shows if it fails.
      setPendingHomework([]);
      setSubmittedHomework([]);
      Alert.alert('Error', 'Could not load your homework. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeworkData();
  };

  const handleHomeworkPress = (homework, isSubmitted) => {
    // Navigate to the submission screen
    navigation.navigate('SubmitHomework', { 
      homework, 
      isSubmitted 
    });
  };

  const renderHomeworkCard = ({ item }) => {
    const isPending = activeTab === 'pending';
    const postDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => handleHomeworkPress(item, !isPending)}
      >
        <View style={[styles.iconBox, { backgroundColor: isPending ? colors.warning + '15' : colors.success + '15' }]}>
          {isPending ? (
            <MaterialCommunityIcons 
              name="file-clock-outline" 
              size={24} 
              color={colors.warning} 
            />
          ) : (
            <Feather 
              name="check-circle" 
              size={24} 
              color={colors.success} 
            />
          )}
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={12} color={colors.text.tertiary} />
            <Text style={styles.metaText}>Assigned: {postDate}</Text>
          </View>
        </View>

        <View style={[styles.actionBadge, { backgroundColor: isPending ? colors.primary : colors.background }]}>
          <Text style={[styles.actionText, { color: isPending ? colors.white : colors.text.secondary }]}>
            {isPending ? 'Submit' : 'View'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout title="Homework" navigation={navigation} showBack={false} showProfileIcon={false}>
      <View style={styles.container}>
        
        {/* Top Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
            activeOpacity={0.7}
          >
            <Feather
              name="clock"
              size={16}
              color={activeTab === 'pending' ? colors.primary : colors.text.secondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pending ({pendingHomework.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'submitted' && styles.activeTab]}
            onPress={() => setActiveTab('submitted')}
            activeOpacity={0.7}
          >
            <Feather
              name="check-circle"
              size={16}
              color={activeTab === 'submitted' ? colors.primary : colors.text.secondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'submitted' && styles.activeTabText]}>
              Submitted ({submittedHomework.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.cardIndigo} style={{ marginTop: 40 }} />
        ) : (
          <FlatList 
            data={activeTab === 'pending' ? pendingHomework : submittedHomework}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.cardIndigo} />
            }
            renderItem={renderHomeworkCard}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Feather 
                    name={activeTab === 'pending' ? 'award' : 'inbox'} 
                    size={48} 
                    color={activeTab === 'pending' ? colors.success : colors.text.tertiary} 
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'pending' ? 'All Caught Up!' : 'No Submissions Yet'}
                </Text>
                <Text style={styles.emptyText}>
                  {activeTab === 'pending' 
                    ? "Great job! You don't have any pending homework right now." 
                    : "You haven't submitted any homework yet. Check your pending tab!"}
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
  container: { flex: 1, backgroundColor: colors.background },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    ...colors.shadow,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 10,
  },
  activeTab: { backgroundColor: colors.primary + '15' },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
  activeTabText: { color: colors.primary, fontWeight: '700' },

  // List
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
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
  metaText: { fontSize: 12, color: colors.text.secondary, fontWeight: '500', marginLeft: 6 },
  
  actionBadge: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  actionText: { fontSize: 13, fontWeight: '700' },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIconBox: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: colors.white, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    ...colors.shadow 
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 }
});

export default HomeworkListScreen;