import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import MainLayout from '../../components/MainLayout';

const HomeworkSubmissionsScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const [submissions, setSubmissions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submitted'); // 'submitted' or 'pending'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch submissions for this homework
      const submissionsResponse = await api.get(`/teacher/submissions/${post._id}`);
      setSubmissions(submissionsResponse.data);

      // Fetch all students in the target class
      const studentsResponse = await api.get(`/teacher/students?classFilter=${post.targetClass}`);
      setAllStudents(studentsResponse.data);
    } catch (error) {
      console.log('Error fetching data:', error);
      Alert.alert('Error', 'Could not fetch data.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate pending students
  const submittedStudentIds = submissions.map(s => s.studentId?._id);
  const pendingStudents = allStudents.filter(student => !submittedStudentIds.includes(student._id));

  const handleViewSubmission = (submission) => {
    // TODO: Navigate to evaluation screen
    Alert.alert("View Submission", `Open file submitted by ${submission.studentId?.name || 'Student'}`);
  };

  const renderSubmittedItem = ({ item }) => {
    const student = item.studentId || {};
    const submitDate = new Date(item.submittedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <TouchableOpacity
        style={styles.studentCard}
        activeOpacity={0.85}
        onPress={() => handleViewSubmission(item)}
      >
        {/* Avatar */}
        {student.profilePhoto ? (
          <Image source={{ uri: student.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {student.name ? student.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {student.name || 'Unknown Student'}
          </Text>
          <Text style={styles.studentMeta}>SR No: {student.srNo || 'N/A'}</Text>
          <View style={styles.timeRow}>
            <Feather name="clock" size={11} color={colors.text.tertiary} />
            <Text style={styles.timeText}>{submitDate}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.submittedBadge}>
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={styles.submittedText}>Submitted</Text>
        </View>

        {/* Arrow */}
        <View style={styles.arrowIcon}>
          <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderPendingItem = ({ item }) => {
    return (
      <View style={[styles.studentCard, { opacity: 0.7 }]}>
        {/* Avatar */}
        {item.profilePhoto ? (
          <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.name ? item.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.studentMeta}>SR No: {item.srNo}</Text>
        </View>

        {/* Status Badge */}
        <View style={styles.pendingBadge}>
          <Feather name="clock" size={14} color={colors.warning} />
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      </View>
    );
  };

  const submittedCount = submissions.length;
  const totalCount = allStudents.length;
  const pendingCount = totalCount - submittedCount;
  const completionRate = totalCount > 0 ? `${Math.round((submittedCount / totalCount) * 100)}%` : '--';

  return (
    <MainLayout title="Homework Submissions" navigation={navigation} showBack={true} showProfileIcon={false}>
      <View style={styles.container}>
        
        {/* Header Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconBox}>
              <Feather name="file-text" size={24} color={colors.primary} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle} numberOfLines={2}>{post.title}</Text>
              <Text style={styles.summaryClass}>Class {post.targetClass}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{submittedCount}/{totalCount}</Text>
              <Text style={styles.statLabel}>Submitted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.success }]}>{completionRate}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
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
              Submitted ({submittedCount})
            </Text>
          </TouchableOpacity>

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
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <FlatList
            data={activeTab === 'submitted' ? submissions : pendingStudents}
            keyExtractor={(item) => item._id}
            renderItem={activeTab === 'submitted' ? renderSubmittedItem : renderPendingItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Feather
                    name={
                      totalCount === 0 ? 'user-x' : 
                      activeTab === 'submitted' ? 'inbox' : 'check-circle'
                    }
                    size={48}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {totalCount === 0 ? 'No Students Found' : 
                   activeTab === 'submitted' ? 'No Submissions Yet' : 'All Done!'}
                </Text>
                <Text style={styles.emptyText}>
                  {totalCount === 0 
                    ? `There are no students registered in Class ${post.targetClass} yet.` : 
                   activeTab === 'submitted' 
                    ? 'No students have submitted their work yet.' 
                    : 'All students have submitted their homework.'}
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
    backgroundColor: colors.background,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.white,
    margin: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    ...colors.shadow,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  summaryClass: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.divider,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    ...colors.shadow,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: colors.primary + '15',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  // Student Card
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    ...colors.shadow,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  studentMeta: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },

  // Badges
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    marginRight: 8,
  },
  submittedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  arrowIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeworkSubmissionsScreen;