import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import { PremiumButton } from '../components/PremiumComponents';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Header & Illustration Area */}
      <View style={styles.topSection}>
        <View style={styles.textContainer}>
          <Text style={styles.logoText}>Pathshala+</Text>
          <Text style={styles.tagline}>Where teachers guide, students grow.</Text>
        </View>

        {/* Placeholder for the 'Blob' illustration in Image 1 */}
        <View style={styles.illustration}>
          <Text style={{ fontSize: 80 }}>🏫</Text>
        </View>
      </View>

      {/* 2. Bottom Action Area (White Card Effect) */}
      <View style={styles.bottomSheet}>
        <Text style={styles.actionTitle}>Welcome Back</Text>
        <Text style={styles.actionSubtitle}>
          Please choose your role to continue
        </Text>

        <View style={styles.buttonGroup}>
          <PremiumButton 
            title="Login as Teacher" 
            onPress={() => navigation.navigate('TeacherLogin')}
            color={colors.primary} 
          />
          <View style={{ height: 16 }} /> 
          <PremiumButton 
            title="Login as Student" 
            onPress={() => navigation.navigate('StudentLogin')}
            color={colors.secondary} 
          />
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Light Gray #F5F7FB
  },
  topSection: {
    flex: 1.2, // Takes up more space
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800', // Extra Bold
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  illustration: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(45, 140, 255, 0.1)', // Very faint blue circle
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    flex: 0.8,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingTop: 40,
    // Heavy Shadow for "Sheet" look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  buttonGroup: {
    width: '100%',
  }
});

export default WelcomeScreen;