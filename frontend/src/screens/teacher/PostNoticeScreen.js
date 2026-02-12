import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import { PremiumInput, PremiumButton } from '../../components/PremiumComponents';

const PostNoticeScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [type, setType] = useState('Notice'); // 'Notice' or 'Homework'
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!title || !description || !targetClass) {
      Alert.alert('Missing Details', 'Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      // Backend Endpoint: /teacher/post-notice
      await api.post('/teacher/post-notice', {
        title,
        description,
        class: targetClass,
        type
      });

      Alert.alert('Sent!', 'Your notice has been posted.', [
        { text: 'Done', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Could not post notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Announcement</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Type Selector (Pill Shape) */}
        <View style={styles.typeContainer}>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'Notice' && styles.activeType]}
            onPress={() => setType('Notice')}
          >
            <Text style={[styles.typeText, type === 'Notice' && styles.activeTypeText]}>Notice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeButton, type === 'Homework' && styles.activeType]}
            onPress={() => setType('Homework')}
          >
            <Text style={[styles.typeText, type === 'Homework' && styles.activeTypeText]}>Homework</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <PremiumInput 
          value={title} 
          onChangeText={setTitle} 
          placeholder="Title (e.g., Holiday Tomorrow)" 
          icon="type"
        />

        <PremiumInput 
          value={targetClass} 
          onChangeText={setTargetClass} 
          placeholder="Target Class (e.g., 10th-A)" 
          icon="users"
        />

        {/* Big Text Area (Matches Image 3) */}
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Write your notice here..."
            placeholderTextColor={colors.text.secondary}
            multiline
            textAlignVertical="top"
          />
          
          {/* Dummy Formatting Toolbar (Visual Only) */}
          <View style={styles.toolbar}>
            <Feather name="bold" size={20} color={colors.text.secondary} style={styles.toolIcon} />
            <Feather name="italic" size={20} color={colors.text.secondary} style={styles.toolIcon} />
            <Feather name="underline" size={20} color={colors.text.secondary} style={styles.toolIcon} />
            <Feather name="image" size={20} color={colors.text.secondary} style={styles.toolIcon} />
          </View>
        </View>

      </ScrollView>

      {/* Floating Submit Button */}
      <View style={styles.footer}>
        <PremiumButton 
          title="Post Now" 
          onPress={handlePost} 
          loading={loading}
          color={colors.text.primary} // Black button for contrast
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: colors.white,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  
  typeContainer: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12,
    padding: 5, marginBottom: 20, borderWidth: 1, borderColor: colors.border
  },
  typeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeType: { backgroundColor: colors.background }, // Light grey highlight
  typeText: { fontWeight: '600', color: colors.text.secondary },
  activeTypeText: { color: colors.text.primary, fontWeight: 'bold' },

  textAreaContainer: {
    backgroundColor: colors.white, borderRadius: 16, height: 300,
    borderWidth: 1, borderColor: colors.border, padding: 15,
    justifyContent: 'space-between'
  },
  textArea: { flex: 1, fontSize: 16, color: colors.text.primary },
  toolbar: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: 15,
  },
  toolIcon: { marginRight: 20 },
  
  footer: { padding: 20, backgroundColor: colors.white }
});

export default PostNoticeScreen;