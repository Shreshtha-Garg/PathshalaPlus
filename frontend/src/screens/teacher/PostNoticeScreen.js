import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Alert, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import { PremiumInput, PremiumButton, PremiumSelect } from '../../components/PremiumComponents';

const PostNoticeScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [type, setType] = useState('Notice'); // 'Notice' or 'Homework' or 'Material'
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    // Validation
    if (!title.trim() || !description.trim() || !targetClass.trim()) {
      Alert.alert('Missing Details', 'Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      // Backend Endpoint: /api/teacher/post-notice
      await api.post('/teacher/post-notice', {
        title: title.trim(),
        description: description.trim(),
        targetClass: targetClass.trim(),
        type
      });

      Alert.alert(
        'Posted Successfully!', 
        `Your ${type.toLowerCase()} has been shared with ${targetClass}.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );

      // Clear form
      setTitle('');
      setDescription('');
      setTargetClass('');

    } catch (error) {
      const msg = error.response?.data?.message || 'Could not post. Please try again.';
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
            <Text style={styles.sectionLabel}>Post Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'Notice' && styles.activeType]}
                onPress={() => setType('Notice')}
                activeOpacity={0.7}
              >
                <Feather 
                  name="bell" 
                  size={18} 
                  color={type === 'Notice' ? colors.primary : colors.text.secondary} 
                />
                <Text style={[styles.typeText, type === 'Notice' && styles.activeTypeText]}>
                  Notice
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeButton, type === 'Homework' && styles.activeType]}
                onPress={() => setType('Homework')}
                activeOpacity={0.7}
              >
                <Feather 
                  name="book-open" 
                  size={18} 
                  color={type === 'Homework' ? colors.primary : colors.text.secondary} 
                />
                <Text style={[styles.typeText, type === 'Homework' && styles.activeTypeText]}>
                  Homework
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeButton, type === 'Material' && styles.activeType]}
                onPress={() => setType('Material')}
                activeOpacity={0.7}
              >
                <Feather 
                  name="file-text" 
                  size={18} 
                  color={type === 'Material' ? colors.primary : colors.text.secondary} 
                />
                <Text style={[styles.typeText, type === 'Material' && styles.activeTypeText]}>
                  Material
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            
            <PremiumInput 
              label="Title *"
              value={title} 
              onChangeText={setTitle} 
              placeholder="e.g., Holiday Tomorrow" 
              icon="type"
            />

            <PremiumSelect
              label="Target Class *"
              value={targetClass}
              onSelect={setTargetClass}
              placeholder="Select class"
              icon="users"
              options={[
                'All',
                '1', '2', '3', '4', '5', '6', 
                '7', '8', '9', '10', '11', '12',
                '10-A', '10-B', '11-Science', '11-Commerce',
                '12-Science', '12-Commerce'
              ]}
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
                  
                  {/* Formatting toolbar (visual only for now) */}
                  <View style={styles.toolbar}>
                    <TouchableOpacity style={styles.toolButton}>
                      <Feather name="bold" size={18} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton}>
                      <Feather name="italic" size={18} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolButton}>
                      <Feather name="link" size={18} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Future: Attachment Upload */}
            <TouchableOpacity 
              style={styles.attachmentButton}
              onPress={() => Alert.alert('Coming Soon', 'File attachment feature is under development.')}
            >
              <Feather name="paperclip" size={20} color={colors.primary} />
              <Text style={styles.attachmentText}>Attach File (Optional)</Text>
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
  
  // Header
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
  
  // Content
  scrollContent: { 
    padding: 20,
    paddingBottom: 40,
  },
  
  // Type Selector Section
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

  // Form Card
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    ...colors.cardShadow,
  },

  // Text Area
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
  toolbar: {
    flexDirection: 'row',
    gap: 12,
  },
  toolButton: {
    padding: 4,
  },

  // Attachment Button
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  attachmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  
  // Footer
  footer: { 
    padding: 20, 
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});

export default PostNoticeScreen;