import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';
import { PremiumInput, PremiumButton } from '../../../components/PremiumComponents';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = 'pathshala_plus'; 

const EditProfileScreen = ({ navigation }) => {
  const [form, setForm] = useState({ 
    mobile: '', 
    profilePhoto: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', 
    oldPassword: '', 
    newPassword: '' 
  });
  
  const [localPhotoUri, setLocalPhotoUri] = useState(null); 
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState(''); 
  const [originalMobile, setOriginalMobile] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    api.get('/teacher/me').then(res => {
      const currentPhoto = res.data.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
      const currentMobile = res.data.mobile || '';
      setForm({ 
        mobile: currentMobile, 
        profilePhoto: currentPhoto,
        oldPassword: '',
        newPassword: ''
      });
      setOriginalPhotoUrl(currentPhoto);
      setOriginalMobile(currentMobile);
    }).catch(err => {
      Alert.alert("Error", "Could not load profile data.");
    });
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need gallery permissions to upload a photo.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2, 
    });

    if (!result.canceled) {
      setLocalPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // 1. Check if anything actually changed
    const isPhotoChanged = localPhotoUri !== null;
    const isMobileChanged = form.mobile !== originalMobile;
    const isPasswordChanging = form.newPassword !== '';

    if (!isPhotoChanged && !isMobileChanged && !isPasswordChanging) {
      navigation.goBack();
      return;
    }

    // Local Validation
    if (form.newPassword && !form.oldPassword) {
      Alert.alert("Required", "Please enter your current password to set a new one.");
      return;
    }

    setLoading(true);
    try {
      let finalPhotoUrl = form.profilePhoto;

      // Upload new photo to Cloudinary if selected
      if (localPhotoUri) {
        if (!CLOUD_NAME) throw new Error("Cloud Name is missing in .env");

        const data = new FormData();
        data.append('file', {
          uri: localPhotoUri,
          type: 'image/jpeg',
          name: 'profile_pic.jpg'
        });
        data.append('upload_preset', UPLOAD_PRESET);
        data.append('folder', 'pathshala_plus/profiles/teachers');

        const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: data,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const result = await uploadRes.json();
        if (result.secure_url) {
          finalPhotoUrl = result.secure_url;
        } else {
          throw new Error(result.error?.message || "Cloudinary upload failed");
        }
      }

      // Save everything to backend
      await api.put('/teacher/update-profile', { 
        mobile: form.mobile,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        profilePhoto: finalPhotoUrl,
        oldProfilePhoto: originalPhotoUrl 
      });

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.log("Update Error:", error);
      Alert.alert("Error", error.response?.data?.message || error.message || "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const displayPhoto = localPhotoUri || form.profilePhoto;

  return (
    <MainLayout title="Edit Profile" navigation={navigation} showBack={true}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Profile Photo Preview */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.photoWrapper}>
              <Image source={{ uri: displayPhoto }} style={styles.photo} />
              <View style={styles.editBadge}>
                <Feather name="camera" size={16} color={colors.white} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHelperText}>Tap to choose a picture</Text>
        </View>

        {/* Basic Info */}
        <View style={styles.inputGroup}>
          <PremiumInput 
            label="Mobile Number" 
            value={form.mobile} 
            onChangeText={t => setForm({...form, mobile: t})} 
            type="numeric"
            maxLength={10}
            icon="smartphone"
          />
        </View>

        {/* Password Update Section */}
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.passwordGroup}>
          
          {/* Old Password with Eye Toggle */}
          <View style={styles.passwordContainer}>
            <PremiumInput 
              label="Current Password" 
              value={form.oldPassword} 
              onChangeText={t => setForm({...form, oldPassword: t})} 
              secureTextEntry={!showOldPassword}
              placeholder="Required if changing password" 
              icon="unlock"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowOldPassword(!showOldPassword)}
            >
              <Feather 
                name={showOldPassword ? "eye" : "eye-off"} 
                size={20} 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>

          {/* New Password with Eye Toggle */}
          <View style={styles.passwordContainer}>
            <PremiumInput 
              label="New Password" 
              value={form.newPassword} 
              onChangeText={t => setForm({...form, newPassword: t})} 
              secureTextEntry={!showNewPassword}
              placeholder="Leave blank to keep current" 
              icon="lock"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Feather 
                name={showNewPassword ? "eye" : "eye-off"} 
                size={20} 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>

        </View>
        
        <View style={{ marginTop: 20 }}>
          <PremiumButton title="Save Changes" onPress={handleSave} loading={loading} />
        </View>

      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  photoWrapper: {
    position: 'relative',
    ...colors.shadow,
  },
  photo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#f0f0f0',
    borderWidth: 4,
    borderColor: colors.white,
    ...colors.shadow
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...colors.shadow,
  },
  photoHelperText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500'
  },
  inputGroup: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 15,
    marginLeft: 4,
  },
  passwordGroup: {
    backgroundColor: colors.white,
    padding: 20,
    paddingBottom: 5,
    borderRadius: 16,
    ...colors.shadow,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 46,
    zIndex: 10,
  },
});

export default EditProfileScreen;