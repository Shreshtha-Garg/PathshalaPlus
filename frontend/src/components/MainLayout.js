import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import colors from '../constants/colors';

const MainLayout = ({ 
  children, 
  title, 
  navigation, 
  showBack = false, 
  isLoading = false, 
  showProfileIcon = false 
}) => {
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (showProfileIcon) {
      loadProfilePic();
    }
  }, [showProfileIcon]);

  const loadProfilePic = async () => {
    try {
      // 1. Try to load from Local Storage (Instant)
      const cachedPic = await AsyncStorage.getItem('userProfilePic');
      
      if (cachedPic && cachedPic !== "https://cdn-icons-png.flaticon.com/512/3135/3135715.png") {
        setProfilePic(cachedPic);
      } else {
        // 2. If no image in storage, fetch from Backend
        const response = await api.get('/teacher/me');
        const fetchedPic = response.data?.profilePhoto;

        if (fetchedPic && fetchedPic !== "https://cdn-icons-png.flaticon.com/512/3135/3135715.png") {
          setProfilePic(fetchedPic);
          // Save it for next time to save bandwidth
          await AsyncStorage.setItem('userProfilePic', fetchedPic);
        }
      }
    } catch (error) {
      console.log("Error loading profile pic in MainLayout:", error.message);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      
      {/* 1. TOP NAVBAR */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {showBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
              <Feather name="arrow-left" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title || "Pathshala+"}</Text>
        </View>
        
        {/* Profile Icon - Conditionally Rendered */}
        {showProfileIcon && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={styles.profileButton}
            activeOpacity={0.8}
          >
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.navProfileImage} />
            ) : (
              <Feather name="user" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 2. MIDDLE CONTENT OR LOADER */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          children
        )}
      </View>

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
    padding: 20, 
    backgroundColor: colors.white, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
    elevation: 2, 
    shadowOpacity: 0.05,
    zIndex: 10,
  },
  headerTitle: { 
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  profileButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: colors.white , 
    ...colors.shadow,
  },
  content: { 
    flex: 1 
  }, 
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default MainLayout;