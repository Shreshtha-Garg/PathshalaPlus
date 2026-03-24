import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const checkSession = async () => {
      try {
        const [session] = await Promise.all([
          AsyncStorage.multiGet(['userToken', 'userRole']),
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);

        const token = session[0][1];
        const role = session[1][1];

        if (token) {
          if (role === 'Teacher' || role === 'Admin') {
            navigation.replace('TeacherRoot');
          } else {
            navigation.replace('StudentRoot');
          }
        } else {
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
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>Pathshala+</Text>
        <Text style={styles.tagline}>Where teachers guide, students grow</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Premium School Management System</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 22,
    marginBottom: 20,
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