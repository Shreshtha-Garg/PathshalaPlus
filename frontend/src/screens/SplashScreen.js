import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // 1. Start Fade-in Animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // 2. Check Session and Navigate
    const checkSession = async () => {
      try {
        // Minimum delay of 2 seconds to show branding
        const [session] = await Promise.all([
          AsyncStorage.multiGet(['userToken', 'userRole']),
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);

        const token = session[0][1];
        const role = session[1][1];

        if (token) {
          // User is logged in - skip welcome and go to dashboard
          if (role === 'Teacher' || role === 'Admin') {
            navigation.replace('TeacherRoot');
          } else {
            navigation.replace('StudentHome');
          }
        } else {
          // No session - go to welcome screen
          navigation.replace('Welcome');
        }
      } catch (e) {
        navigation.replace('Welcome');
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoCircle}>
          <Feather name="book-open" size={50} color={colors.primary} />
        </View>
        <Text style={styles.brandName}>Pathshala+</Text>
        <Text style={styles.tagline}>Where teachers guide, students grow</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Premium School Management</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...colors.cardShadow,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});

export default SplashScreen;