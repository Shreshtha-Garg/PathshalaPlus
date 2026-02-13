import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Alert, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
// Fixed the deprecation warning by importing from the legacy path as requested by Expo logs
import { getInfoAsync } from 'expo-file-system/legacy'; 
import api from '../../services/api';
import colors from '../../constants/colors';
import { PremiumInput, PremiumButton, PremiumSelect } from '../../components/PremiumComponents';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
const UPLOAD_PRESET = 'pathshala_plus'; 

const PostNoticeScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [type, setType] = useState('Notice'); 
  
  const [attachment, setAttachment] = useState(null); 
  const [loading, setLoading] = useState(false);

  const getTitlePlaceholder = () => {
    if (type === 'Homework') return "e.g., Maths Homework";
    if (type === 'Material') return "e.g., Chapter 1 Notes";
    return "e.g., Holiday Tomorrow";
  };

  // --- SMART FILE PICKER & COMPRESSION ---
  const pickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      let file = result.assets[0];
      let finalUri = file.uri;
      let finalSize = file.size;
      let finalMimeType = file.mimeType || 'application/octet-stream';
      let finalName = file.name;

      // 1. IF IMAGE: Apply "WhatsApp-style" compression (NO width resizing, just quality drop)
      if (finalMimeType.startsWith('image/')) {
        const manipResult = await ImageManipulator.manipulateAsync(
          file.uri,
          [], // Empty array = absolutely no resizing
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG } // 60% quality JPEG
        );
        
        finalUri = manipResult.uri;
        finalMimeType = 'image/jpeg';
        
        // Change extension to .jpg if it was something else
        finalName = finalName.replace(/\.[^/.]+$/, "") + ".jpg";

        // Get the new file size after compression using the warning-free legacy import
        const fileInfo = await getInfoAsync(finalUri);
        finalSize = fileInfo.size;
      }

      // 2. CHECK SIZE: Dynamic limits based on file type
      const isPdf = finalMimeType === 'application/pdf';
      const MAX_SIZE_BYTES = isPdf ? (10 * 1024 * 1024) : (5 * 1024 * 1024); // 10MB for PDF, 5MB for others

      if (finalSize > MAX_SIZE_BYTES) {
        Alert.alert(
          "File Too Large", 
          `Please select a ${isPdf ? 'PDF smaller than 10 MB' : 'file smaller than 5 MB'}.`
        );
        return;
      }

      // 3. Set the final approved file to state
      setAttachment({
        uri: finalUri,
        name: finalName,
        mimeType: finalMimeType,
        size: finalSize
      });

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not pick the file.");
    }
  };

  // --- UPLOAD TO CLOUDINARY & SAVE ---
  const handlePost = async () => {
    if (!title.trim() || !description.trim() || !targetClass.trim()) {
      Alert.alert('Missing Details', 'Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      let uploadedAttachmentUrl = null;

      // Upload Attachment to Cloudinary if it exists
      if (attachment) {
        if (!CLOUD_NAME) throw new Error("Cloud Name is missing in .env");

        const data = new FormData();
        data.append('file', {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.mimeType
        });
        data.append('upload_preset', UPLOAD_PRESET);
        data.append('folder', `pathshala_plus/posts/${type.toLowerCase()}s`);

        const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: data,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadData = await uploadRes.json();
        
        if (uploadData.secure_url) {
          uploadedAttachmentUrl = uploadData.secure_url;
        } else {
          throw new Error("Failed to upload attachment to cloud.");
        }
      }

      // Save Post to Database
      await api.post('/teacher/post-notice', {
        title: title.trim(),
        description: description.trim(),
        targetClass: targetClass.trim(),
        type,
        attachmentUrl: uploadedAttachmentUrl 
      });

      Alert.alert(
        'Posted Successfully!', 
        `Your ${type.toLowerCase()} has been shared with Class ${targetClass}.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );

      // Clear the form on successful post (optional but good UX)
      setTitle('');
      setDescription('');
      setTargetClass('');
      setAttachment(null);

    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Could not post. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Type Selector */}
          <View style={styles.section}>
            <View style={styles.typeContainer}>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'Notice' && styles.activeType]}
                onPress={() => setType('Notice')}
                activeOpacity={0.7}
              >
                <Feather name="bell" size={18} color={type === 'Notice' ? colors.primary : colors.text.secondary} />
                <Text style={[styles.typeText, type === 'Notice' && styles.activeTypeText]}>Notice</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeButton, type === 'Homework' && styles.activeType]}
                onPress={() => setType('Homework')}
                activeOpacity={0.7}
              >
                <Feather name="book-open" size={18} color={type === 'Homework' ? colors.primary : colors.text.secondary} />
                <Text style={[styles.typeText, type === 'Homework' && styles.activeTypeText]}>Homework</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeButton, type === 'Material' && styles.activeType]}
                onPress={() => setType('Material')}
                activeOpacity={0.7}
              >
                <Feather name="file-text" size={18} color={type === 'Material' ? colors.primary : colors.text.secondary} />
                <Text style={[styles.typeText, type === 'Material' && styles.activeTypeText]}>Material</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            
            <PremiumInput 
              label="Title *"
              value={title} 
              onChangeText={setTitle} 
              placeholder={getTitlePlaceholder()} 
              icon="type"
            />

            <PremiumSelect
              label="Target Class *"
              value={targetClass}
              onSelect={setTargetClass}
              placeholder="Select class"
              icon="users"
              options={['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
            />

            {/* Description Text Area */}
            <View style={styles.textAreaWrapper}>
              <Text style={styles.label}>Description *</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Write your message here..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  textAlignVertical="top"
                  numberOfLines={8}
                />
                
                {/* Character count */}
                <View style={styles.textAreaFooter}>
                  <Text style={styles.charCount}>
                    {description.length} characters
                  </Text>
                </View>
              </View>
            </View>

            {/* Attachment Button */}
            <TouchableOpacity 
              style={[styles.attachmentButton, attachment && { borderColor: colors.success }]}
              onPress={pickAttachment}
              activeOpacity={0.7}
            >
              <Feather 
                name={attachment ? "check-circle" : "paperclip"} 
                size={20} 
                color={attachment ? colors.success : colors.primary} 
              />
              <Text style={[styles.attachmentText, attachment && { color: colors.success }]} numberOfLines={1}>
                {attachment ? attachment.name : "Attach File (PDF: 10MB, Others: 5MB)"}
              </Text>
              
              {/* Clear button if an attachment is selected */}
              {attachment && (
                <TouchableOpacity onPress={() => setAttachment(null)} style={{ marginLeft: 'auto', padding: 5 }}>
                  <Feather name="x-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

          </View>

        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <PremiumButton 
            title={loading ? "Posting..." : "Post Now"} 
            onPress={handlePost} 
            loading={loading}
            color={colors.primary}
          />
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row', 
    backgroundColor: colors.white, 
    borderRadius: 12,
    padding: 4,
    ...colors.cardShadow,
  },
  typeButton: { 
    flex: 1, 
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  activeType: { 
    backgroundColor: colors.background,
  },
  typeText: { 
    fontWeight: '600', 
    color: colors.text.secondary,
    fontSize: 14,
  },
  activeTypeText: { 
    color: colors.primary, 
    fontWeight: '700' 
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    ...colors.cardShadow,
  },
  textAreaWrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginLeft: 2,
  },
  textAreaContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 200,
    padding: 16,
  },
  textArea: { 
    flex: 1,
    fontSize: 16, 
    color: colors.text.primary,
    minHeight: 140,
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  attachmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    flexShrink: 1, 
  },
  footer: { 
    padding: 20, 
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});

export default PostNoticeScreen;