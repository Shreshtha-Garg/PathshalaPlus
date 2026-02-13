import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Linking, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';

const AboutPathshalaScreen = ({ navigation }) => {
  const developer = {
    name: "Shreshtha Garg",
    role: "Lead Developer & Visionary",
    email: "raghavgarg037@gmail.com",
    website: "https://shreshtha-two.vercel.app/",
    linkedin: "https://www.linkedin.com/in/shreshth-garg-3ba629208/",
    photo: "https://shreshtha-two.vercel.app/static/media/profile.79711206d554734864bc.jpg",
    fallbackIcon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  };

  const openLink = (url) => Linking.openURL(url);
  const currentYear = new Date().getFullYear();

  return (
    <MainLayout title="About Pathshala+" navigation={navigation} showBack={true}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section - Logo & Name Side by Side */}
        <View style={styles.heroSection}>
          <View style={styles.brandRow}>
            <View style={styles.logoContainer}>
              <Feather name="book-open" size={32} color={colors.white} />
            </View>
            <Text style={styles.brand}>Pathshala+</Text>
          </View>
          <Text style={styles.tagline}>Where teachers guide, students grow.</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            Transforming education through technology. Pathshala+ creates a seamless, 
            paperless ecosystem connecting teachers, students, and parents for a 
            better learning experience.
          </Text>
        </View>

        {/* Developer Section */}
        <Text style={styles.sectionTitle}>Meet the Creator</Text>
        <View style={styles.devCard}>
          <View style={styles.devPhotoWrapper}>
            <View style={styles.photoContainer}>
              <Image 
                source={{ uri: developer.photo }} 
                defaultSource={{ uri: developer.fallbackIcon }} 
                style={styles.devPhoto} 
                resizeMode="cover"
              />
            </View>
            <View style={styles.devBadge}>
              <Feather name="code" size={18} color={colors.white} />
            </View>
          </View>
          
          <Text style={styles.devName}>{developer.name}</Text>
          <Text style={styles.devRole}>{developer.role}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.contactRow}>
            <TouchableOpacity 
              style={[styles.iconBtn, { backgroundColor: colors.primary + '15' }]} 
              onPress={() => openLink(`mailto:${developer.email}`)}
            >
              <Feather name="mail" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconBtn, { backgroundColor: '#0077b515' }]} 
              onPress={() => openLink(developer.linkedin)}
            >
              <Feather name="linkedin" size={20} color="#0077b5" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconBtn, { backgroundColor: colors.text.secondary + '15' }]} 
              onPress={() => openLink(developer.website)}
            >
              <Feather name="globe" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © {currentYear} Pathshala+ | Made with ❤️ in India
        </Text>

      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20,
  },
  heroSection: { 
    alignItems: 'center', 
    marginBottom: 16,
    paddingVertical: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...colors.shadow,
  },
  brand: { 
    fontSize: 30, 
    fontWeight: '900', 
    color: colors.text.primary, 
    letterSpacing: -0.5,
  },
  tagline: { 
    fontSize: 14, 
    color: colors.text.secondary, 
    fontStyle: 'italic', 
    marginBottom: 8,
    fontWeight: '500',
  },
  versionBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  missionCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    ...colors.shadow,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 10,
  },
  missionText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 12,
    color: colors.text.primary,
    marginLeft: 4,
  },
  devCard: { 
    backgroundColor: colors.white, 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center', 
    ...colors.shadow,
    marginBottom: 16,
  },
  devPhotoWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden', // This crops the image to circle
    borderWidth: 5,
    borderColor: colors.primary + '20',
    backgroundColor: '#f0f0f0',
  },
  devPhoto: { 
    width: '100%',
    height: '100%',
    // Position adjustments to focus on face
    transform: [
      { scale: 2.5 }, // Zoom in on the image
      { translateY: 3 }, // Move up to center face
      { translateX: 0 }, // Adjust horizontal if needed
    ],
  },
  devBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...colors.shadow,
  },
  devName: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: colors.text.primary,
    marginBottom: 3,
  },
  devRole: { 
    fontSize: 14, 
    color: colors.text.secondary, 
    marginBottom: 16,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.divider || '#f0f0f0',
    marginBottom: 16,
  },
  contactRow: { 
    flexDirection: 'row', 
    gap: 14,
  },
  iconBtn: { 
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  footer: { 
    textAlign: 'center', 
    color: colors.text.secondary, 
    fontSize: 12,
    marginTop: 8,
  }
});

export default AboutPathshalaScreen;