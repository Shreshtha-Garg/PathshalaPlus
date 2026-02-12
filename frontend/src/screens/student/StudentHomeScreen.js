import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import colors from '../../constants/colors';
import FeedCard from '../../components/FeedCard';
import { Feather } from '@expo/vector-icons';

const StudentHomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dummy data to show UI before backend loads (Matches Image 4 examples)
  const dummyData = [
    { _id: '1', title: 'Upcoming Math Exam', description: 'Prepare for the math exam scheduled on April 15. Ensure you complete revision tasks.', type: 'Notice' },
    { _id: '2', title: 'Science Project Submission', description: 'Submit your science project by April 20. Attach your project file.', type: 'Homework' },
  ];

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const studentClass = await AsyncStorage.getItem('studentClass');
      const token = await AsyncStorage.getItem('userToken');

      if (!token) return;

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Attempt to fetch from backend
      try {
        const response = await api.get(`/student/feed/${studentClass}`);
        if (response.data && response.data.length > 0) {
          setPosts(response.data);
        } else {
          setPosts(dummyData); // Fallback to dummy data if feed is empty
        }
      } catch (err) {
        console.log("Backend offline, using dummy data");
        setPosts(dummyData); 
      }
      
      setLoading(false);

    } catch (error) {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>Pathshala+</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Feed List */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your Feed</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList 
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <FeedCard 
                title={item.title}
                description={item.description}
                buttonText={item.type === 'Homework' ? "Upload Work" : "Mark as Read"}
                onPress={() => Alert.alert("Action", `Interacted with ${item.title}`)}
              />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* 3. Bottom Nav (Visual Only) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
           <Feather name="home" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity>
           <Feather name="bell" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity>
           <Feather name="user" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Light Gray
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 10,
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
  },
  logoutButton: {
    backgroundColor: colors.text.primary, // Black button
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginBottom: 20,
    marginTop: 10,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...colors.shadow,
    shadowOffset: { width: 0, height: -5 },
  }
});

export default StudentHomeScreen;