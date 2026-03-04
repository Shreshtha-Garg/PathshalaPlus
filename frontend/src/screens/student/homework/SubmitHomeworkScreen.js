import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Linking 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';
import { PremiumButton } from '../../../components/PremiumComponents';

const SubmitHomeworkScreen = ({ route, navigation }) => {
  const { homework, isSubmitted } = route.params;
  
  // --- SUBMISSION STATES ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const UPLOAD_PRESET = 'pathshala_plus';

  // --- ATTACHMENT VIEWING STATES ---
  const [loadingAction, setLoadingAction] = useState(null);
  const [displayFileName, setDisplayFileName] = useState('Attachment');
  const [fileType, setFileType] = useState('unknown');
  const [fileIcon, setFileIcon] = useState('file');
  const [fileColor, setFileColor] = useState(colors.text.secondary);

  // ==========================================
  // 1. TEACHER ATTACHMENT LOGIC (Viewing/Downloading)
  // ==========================================
  
  useEffect(() => {
    if (homework.attachmentUrl) {
      // Get filename
      let finalName = "Attachment";
      if (homework.attachmentName) {
        finalName = homework.attachmentName; 
      } else {
        const extractedName = homework.attachmentUrl.split('/').pop().split('?')[0];
        finalName = decodeURIComponent(extractedName);
      }
      setDisplayFileName(finalName);

      // Determine file type and styling
      const url = homework.attachmentUrl.toLowerCase();
      const name = finalName.toLowerCase();
      
      if (url.includes('.pdf') || name.endsWith('.pdf')) {
        setFileType('pdf');
        setFileIcon('file-text');
        setFileColor(colors.error);
      } else if (url.includes('.doc') || name.endsWith('.doc') || name.endsWith('.docx')) {
        setFileType('document');
        setFileIcon('file-text');
        setFileColor('#2b579a');
      } else if (url.includes('.ppt') || name.endsWith('.ppt') || name.endsWith('.pptx')) {
        setFileType('presentation');
        setFileIcon('airplay');
        setFileColor('#d24726');
      } else if (url.includes('image') || name.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        setFileType('image');
        setFileIcon('image');
        setFileColor(colors.success);
      } else {
        setFileType('file');
        setFileIcon('file');
        setFileColor(colors.text.secondary);
      }
    }
  }, [homework.attachmentUrl, homework.attachmentName]);

  const getLocalUri = (fileName) => {
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return FileSystem.documentDirectory + `Pathshala_${homework._id}_${safeName}`;
  };

  const getMimeType = () => {
    switch(fileType) {
      case 'pdf': return 'application/pdf';
      case 'document': return displayFileName.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/msword';
      case 'presentation': return displayFileName.toLowerCase().endsWith('.pptx') ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/vnd.ms-powerpoint';
      case 'image': return 'image/jpeg';
      default: return 'application/octet-stream';
    }
  };

  const downloadFile = async (localUri) => {
    try {
      const downloadUrl = homework.attachmentUrl;
      const existingFile = await FileSystem.getInfoAsync(localUri);
      
      if (existingFile.exists && existingFile.size === 0) {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
      }

      const downloadResult = await FileSystem.downloadAsync(downloadUrl, localUri);
      
      if (!downloadResult || !downloadResult.uri) throw new Error("Download failed");
      if (downloadResult.status !== 200) throw new Error("Status Error");

      await new Promise(resolve => setTimeout(resolve, 500));
      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      
      if (!fileInfo.exists || fileInfo.size === 0) throw new Error("0 bytes");

      return downloadResult.uri;
    } catch (error) {
      throw error;
    }
  };

  const handleOpen = async () => {
    if (!homework.attachmentUrl) return;
    try {
      setLoadingAction('open');
      const localUri = getLocalUri(displayFileName);
      
      let fileToOpen = null;
      try {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists && fileInfo.size > 0) fileToOpen = localUri;
      } catch (err) {}
      
      if (!fileToOpen) fileToOpen = await downloadFile(localUri);

      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(fileToOpen);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          type: getMimeType(),
        });
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileToOpen, {
            mimeType: getMimeType(),
            UTI: fileType === 'pdf' ? 'com.adobe.pdf' : fileType === 'image' ? 'public.jpeg' : undefined,
          });
        }
      }
    } catch (error) {
      let message = 'Make sure you have an app installed to open this file type.';
      let storeLink = null;
      
      if (fileType === 'pdf') {
        message = 'Please install a PDF viewer app.';
        storeLink = 'market://details?id=com.adobe.reader';
      }
      Alert.alert(
        'Cannot Open File', message,
        [ { text: 'OK' }, Platform.OS === 'android' && storeLink && { text: 'Install App', onPress: () => Linking.openURL(storeLink) } ].filter(Boolean)
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownload = async () => {
    if (!homework.attachmentUrl) return;
    try {
      setLoadingAction('save');
      const localUri = getLocalUri(displayFileName);
      
      let needsDownload = true;
      try {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists && fileInfo.size > 0) needsDownload = false;
      } catch (err) {}
      
      if (needsDownload) await downloadFile(localUri);

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) return;

        const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, displayFileName, getMimeType());
        const fileContent = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
        
        await FileSystem.StorageAccessFramework.writeAsStringAsync(newFileUri, fileContent, { encoding: FileSystem.EncodingType.Base64 });
        Alert.alert('Success!', `File saved successfully to your selected folder.`);
      } else {
        await Sharing.shareAsync(localUri, { mimeType: getMimeType(), UTI: fileType === 'pdf' ? 'com.adobe.pdf' : undefined });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save the file. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };


  // ==========================================
  // 2. STUDENT SUBMISSION LOGIC
  // ==========================================

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', 
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }
        setSelectedFile(file);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not select the file.');
    }
  };

  const handleSubmitWork = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select a file to submit.');
      return;
    }

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name,
      });
      data.append('upload_preset', UPLOAD_PRESET); 
      data.append('folder', 'student_uploads/hw');

      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

      const cloudinaryRes = await fetch(cloudinaryUrl, {
        method: 'POST', body: data,
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
      });

      const cloudData = await cloudinaryRes.json();
      if (!cloudData.secure_url) throw new Error('Cloudinary upload failed');

      await api.post('/student/submit-homework', {
        postId: homework._id,
        attachmentUrl: cloudData.secure_url,
        fileName: selectedFile.name,
      });

      Alert.alert('Success!', 'Your homework has been submitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Upload Failed', 'There was an error submitting your work. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout title="Homework Details" navigation={navigation} showBack={true} showProfileIcon={false}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* --- TEACHER'S ASSIGNMENT INFO --- */}
        <View style={styles.assignmentBox}>
          
          <View style={styles.topHeaderRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Due Assignment</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(homework.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          
          <Text style={styles.title}>{homework.title}</Text>

          {/* METADATA ROW: Teacher Name & Class */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Feather name="user" size={14} color={colors.text.tertiary} />
              <Text style={styles.metaText}>
                {/* Fallback to 'Class Teacher' if backend doesn't populate the name */}
                {homework.createdBy?.name || 'Class Teacher'}
              </Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Feather name="users" size={14} color={colors.text.tertiary} />
              <Text style={styles.metaText}>Class {homework.targetClass}</Text>
            </View>
          </View>

          {homework.description ? (
            <Text style={styles.description}>{homework.description}</Text>
          ) : null}

          {/* Teacher's Attachment Display directly here */}
          {homework.attachmentUrl && (
            <View style={styles.attachmentSection}>
              <Text style={styles.attachmentSectionTitle}>Attachment</Text>
              
              <View style={styles.attachmentCard}>
                
                {/* LEFT SIDE: Click to Open */}
                <TouchableOpacity 
                  style={styles.attachmentClickableArea} 
                  activeOpacity={0.7}
                  onPress={handleOpen}
                  disabled={loadingAction !== null}
                >
                  <View style={[styles.iconBox, { backgroundColor: fileColor + '15' }]}>
                    {loadingAction === 'open' ? (
                      <ActivityIndicator size="small" color={fileColor} />
                    ) : (
                      <Feather name={fileIcon} size={24} color={fileColor} />
                    )}
                  </View>
                  
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {displayFileName}
                    </Text>
                    <Text style={styles.attachmentSub}>
                      {loadingAction === 'open' ? 'Opening...' : 'Tap to open'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* RIGHT SIDE: Click to Download */}
                <TouchableOpacity 
                  style={styles.downloadButton}
                  activeOpacity={0.6}
                  onPress={handleDownload}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'save' ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Feather name="download" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>

              </View>
            </View>
          )}
        </View>

        {/* --- STUDENT SUBMISSION AREA --- */}
        <View style={styles.submissionBox}>
          <Text style={styles.sectionTitle}>Your Work</Text>
          
          {isSubmitted ? (
            <View style={styles.submittedState}>
              <Feather name="check-circle" size={48} color={colors.success} style={{ marginBottom: 12 }} />
              <Text style={styles.submittedTitle}>Successfully Submitted</Text>
              <Text style={styles.submittedText}>You have already completed this assignment.</Text>

              {/* View their own submitted file */}
              {homework.submissionUrl && (
                <TouchableOpacity 
                  style={[styles.viewOwnBtn, { backgroundColor: colors.success + '15' }]}
                  onPress={() => Linking.openURL(homework.submissionUrl)}
                >
                  <Feather name="external-link" size={16} color={colors.success} />
                  <Text style={[styles.viewOwnText, { color: colors.success }]}>View My Submission</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.uploadZone, selectedFile && styles.uploadZoneActive]}
                onPress={handlePickFile}
                activeOpacity={0.7}
              >
                {selectedFile ? (
                  <>
                    <Feather name="file" size={32} color={colors.cardIndigo} />
                    <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                    <Text style={styles.changeFileText}>Tap to change file</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.uploadIconBox}>
                      <Feather name="upload-cloud" size={28} color={colors.cardIndigo} />
                    </View>
                    <Text style={styles.uploadTitle}>Upload your assignment</Text>
                    <Text style={styles.uploadSub}>PDF, DOC, or Images allowed</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={{ marginTop: 24 }}>
                <PremiumButton 
                  title="Submit Assignment" 
                  onPress={handleSubmitWork}
                  loading={isUploading}
                  color={colors.cardIndigo}
                />
              </View>
            </>
          )}
        </View>

      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  
  // Assignment Info
  assignmentBox: {
    backgroundColor: colors.white, padding: 20, borderRadius: 16,
    marginBottom: 20, ...colors.cardShadow,
  },
  topHeaderRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 
  },
  badge: {
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  badgeText: { color: colors.warning, fontSize: 12, fontWeight: '700' },
  dateText: { fontSize: 13, color: colors.text.tertiary, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginBottom: 8, lineHeight: 30 },
  
  // Metadata Row
  metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, color: colors.text.secondary, marginLeft: 6, fontWeight: '600' },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 10 },
  
  description: { fontSize: 15, color: colors.text.secondary, lineHeight: 24, marginBottom: 4 },
  
  // Teacher Attachment Styles
  attachmentSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  attachmentSectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text.secondary, marginBottom: 10 },
  attachmentCard: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.background,
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  attachmentClickableArea: {
    flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  attachmentInfo: { flex: 1, paddingRight: 8 },
  attachmentName: { fontSize: 14, fontWeight: '700', color: colors.text.primary, marginBottom: 2 },
  attachmentSub: { fontSize: 12, color: colors.text.secondary },
  downloadButton: {
    padding: 14, justifyContent: 'center', alignItems: 'center',
    borderLeftWidth: 1, borderLeftColor: '#e0e0e0',
  },

  // Submission Area
  submissionBox: {
    backgroundColor: colors.white, padding: 20, borderRadius: 16, ...colors.cardShadow,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 16 },
  
  uploadZone: {
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: 16, padding: 30, alignItems: 'center', backgroundColor: colors.background,
  },
  uploadZoneActive: { borderColor: colors.cardIndigo, backgroundColor: colors.cardIndigo + '05' },
  uploadIconBox: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: colors.cardIndigo + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  uploadTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 6 },
  uploadSub: { fontSize: 13, color: colors.text.secondary },
  fileName: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginTop: 12, textAlign: 'center' },
  changeFileText: { fontSize: 13, color: colors.cardIndigo, fontWeight: '600', marginTop: 8 },

  // Submitted State
  submittedState: { alignItems: 'center', paddingVertical: 20 },
  submittedTitle: { fontSize: 18, fontWeight: '700', color: colors.success, marginBottom: 8 },
  submittedText: { fontSize: 14, color: colors.text.secondary, textAlign: 'center' },
  viewOwnBtn: {
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 20,
  },
  viewOwnText: { fontWeight: '700', marginLeft: 8, fontSize: 14 },
});

export default SubmitHomeworkScreen;