import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';

const StudentHomeScreen = ({ navigation }) => {
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({ pendingHomework: 0, newNotices: 0 });
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setStudentName(name.split(' ')[0]);

      const response = await api.get('/student/dashboard');

      setStats(response.data.stats);
      setRecentPosts(response.data.recentPosts);

    } catch (error) {
      console.log('Error loading student dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const QuickAlertCard = ({ title, count, icon, iconFamily, color, onPress }) => {
    const IconComponent = iconFamily === 'MaterialCommunity' ? MaterialCommunityIcons : Feather;

    return (
      <TouchableOpacity
        style={[styles.alertCard, { backgroundColor: color }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.alertIconBox}>
          <IconComponent name={icon} size={24} color={color} />
        </View>
        <View style={styles.alertInfo}>
          <Text style={styles.alertCount}>{count}</Text>
          <Text style={styles.alertTitle}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Helper function to return complete icon configuration
  const getPostIconConfig = (post) => {
    const { type, isSubmitted } = post;

    if (type === 'Notice') {
      return { name: 'bell', family: 'Feather', color: colors.primary };
    } else if (type === 'Homework') {
      console.log('hw is submitted:', isSubmitted); // Debug log to check submission status
      // Show Checkmark if submitted, otherwise show Clock
      return isSubmitted
        ? { name: 'checkbox-marked-circle-outline', family: 'MaterialCommunity', color: colors.success }
        : { name: 'file-clock-outline', family: 'MaterialCommunity', color: colors.warning };
    } else if (type === 'Material') {
      return { name: 'file-text', family: 'Feather', color: colors.success };
    }
    return { name: 'file', family: 'Feather', color: colors.text.secondary };
  };

  return (
    <MainLayout title="Dashboard" navigation={navigation} showBack={false} showProfileIcon={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >

        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hello, {studentName || 'Student'} 👋</Text>
          <Text style={styles.subGreeting}>Ready to learn today?</Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Quick Alerts / Stats */}
            <View style={styles.statsRow}>
              <QuickAlertCard
                title={stats.pendingHomework === 0 ? "No Pending Homework" : "Pending Homework"}
                count={stats.pendingHomework === 0 ? "Done" : stats.pendingHomework}
                icon={stats.pendingHomework === 0 ? "check-circle" : "file-clock-outline"}
                iconFamily={stats.pendingHomework === 0 ? "Feather" : "MaterialCommunity"}
                color={stats.pendingHomework === 0 ? colors.success : colors.warning}
                onPress={() => navigation.navigate('Homework')}
              />
              <QuickAlertCard
              // if stats.NewNotices is 0, show "No New Notices" with an info icon, otherwise show the count with a bell icon,also if one notice say "1 New Notice" instead of "New Notices"
                title={stats.newNotices === 0 ? "No New Notices" : stats.newNotices === 1 ? "1 New Notice" : "New Notices"}
                count={stats.newNotices === 0 ? "None" : stats.newNotices}
                icon="bell"
                iconFamily="Feather"
                color={colors.primary}
                onPress={() => navigation.navigate('Updates')}
              />
            </View>

            {/* Recent Activity Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Updates')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {recentPosts.length > 0 ? (
              recentPosts.map((post) => {
                const config = getPostIconConfig(post);
                const PostIconComponent = config.family === 'MaterialCommunity' ? MaterialCommunityIcons : Feather;

                return (
                  <TouchableOpacity
                    key={post._id}
                    style={styles.postCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (post.type === 'Homework') {
                        navigation.navigate('Homework'); // Send them to the Homework tab
                      } else {
                        navigation.navigate('ViewPost', { post }); // Send them to the viewing screen
                      }
                    }}
                  >
                    <View style={[styles.postIconBox, { backgroundColor: config.color + '15' }]}>
                      <PostIconComponent name={config.name} size={20} color={config.color} />
                    </View>
                    <View style={styles.postInfo}>
                      <Text style={styles.postTitle} numberOfLines={1}>{post.title}</Text>
                      <View style={styles.postMeta}>
                        <Text style={styles.postType}>{post.type}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.postDate}>
                          {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyBox}>
                <Feather name="inbox" size={40} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>No recent activity for your class.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  greetingContainer: { marginBottom: 24 },
  greetingText: { fontSize: 28, fontWeight: '800', color: colors.text.primary, marginBottom: 4 },
  subGreeting: { fontSize: 15, color: colors.text.secondary, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 30 },
  alertCard: {
    flex: 1, padding: 16, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center',
    ...colors.shadow
  },
  alertIconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  alertInfo: { flex: 1 },
  alertCount: { fontSize: 20, fontWeight: '800', color: colors.white, marginBottom: 2 },
  alertTitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  seeAllText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  postCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    padding: 16, borderRadius: 16, marginBottom: 12, ...colors.shadow
  },
  postIconBox: {
    width: 46, height: 46, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14
  },
  postInfo: { flex: 1, paddingRight: 10 },
  postTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  postMeta: { flexDirection: 'row', alignItems: 'center' },
  postType: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text.tertiary, marginHorizontal: 6 },
  postDate: { fontSize: 12, color: colors.text.tertiary, fontWeight: '500' },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, color: colors.text.secondary, fontSize: 14, fontWeight: '500' }
});

export default StudentHomeScreen;