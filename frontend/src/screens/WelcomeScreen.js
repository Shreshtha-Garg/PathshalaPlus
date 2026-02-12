import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header/Branding */}
      <View style={styles.header}>
        <Text style={styles.brandName}>Pathshala+</Text>
        <Text style={styles.tagline}>Where teachers guide, students grow</Text>
      </View>

      {/* Split Choice Cards */}
      <View style={styles.cardsContainer}>
        
        {/* Teacher Card */}
        <TouchableOpacity 
          style={[styles.card, styles.teacherCard]}
          onPress={() => navigation.navigate('TeacherLogin')}
          activeOpacity={0.9}
        >
          <View style={styles.iconCircle}>
            <Feather name="briefcase" size={32} color={colors.white} />
          </View>
          <Text style={styles.cardTitle}>I am a Teacher</Text>
          <Text style={styles.cardSubtitle}>Manage your class & students</Text>
          <View style={styles.arrowContainer}>
            <Feather name="arrow-right" size={24} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Student Card */}
        <TouchableOpacity 
          style={[styles.card, styles.studentCard]}
          onPress={() => navigation.navigate('StudentLogin')}
          activeOpacity={0.9}
        >
          <View style={styles.iconCircle}>
            <Feather name="book-open" size={32} color={colors.white} />
          </View>
          <Text style={styles.cardTitle}>I am a Student</Text>
          <Text style={styles.cardSubtitle}>View homework & notices</Text>
          <View style={styles.arrowContainer}>
            <Feather name="arrow-right" size={24} color={colors.white} />
          </View>
        </TouchableOpacity>

      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Premium School Management System</Text>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 20, // Space between cards
  },
  card: {
    height: height * 0.28,
    borderRadius: 24,
    padding: 28,
    justifyContent: 'space-between',
    ...colors.shadow,
  },
  teacherCard: {
    backgroundColor: colors.primary,
  },
  studentCard: {
    backgroundColor: colors.secondary,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    marginTop: 16,
  },
  cardSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  arrowContainer: {
    alignSelf: 'flex-end',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});

export default WelcomeScreen;