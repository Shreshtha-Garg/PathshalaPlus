import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, 
  Image, Platform, Linking, Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import colors from '../../constants/colors';
import MainLayout from '../../components/MainLayout';

const ViewStudentSubmissionScreen = ({ route, navigation }) => {
  const { submission } = route.params;
  const student = submission.studentId || {};
  
  // Handle both possible DB fields just in case
  const fileUrl = submission.fileUrl || submission.attachmentUrl; 

  // --- ATTACHMENT VIEWING STATES ---
  const [loadingAction, setLoadingAction] = useState(null);
  const [displayFileName, setDisplayFileName] = useState('Student_Submission');
  const [fileType, setFileType] = useState('unknown');
  const [fileIcon, setFileIcon] = useState('file');
  const [fileColor, setFileColor] = useState(colors.text.secondary);

  useEffect(() => {
    if (fileUrl) {
      let finalName = submission.fileName; 
      
      if (!finalName) {
        const extractedName = fileUrl.split('/').pop().split('?')[0];
        finalName = decodeURIComponent(extractedName);
      }
      setDisplayFileName(finalName);

      const url = fileUrl.toLowerCase();
      const name = finalName.toLowerCase();
      
      if (url.includes('.pdf') || name.endsWith('.pdf')) {
        setFileType('pdf'); setFileIcon('file-text'); setFileColor(colors.error);
      } else if (url.includes('.doc') || name.endsWith('.doc') || name.endsWith('.docx')) {
        setFileType('document'); setFileIcon('file-text'); setFileColor('#2b579a');
      } else if (url.includes('.ppt') || name.endsWith('.ppt') || name.endsWith('.pptx')) {
        setFileType('presentation'); setFileIcon('airplay'); setFileColor('#d24726');
      } else if (url.includes('image') || name.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        setFileType('image'); setFileIcon('image'); setFileColor(colors.success);
      } else {
        setFileType('file'); setFileIcon('file'); setFileColor(colors.text.secondary);
      }
    }
  }, [fileUrl]);

  const getLocalUri = (fileName) => {
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return FileSystem.documentDirectory + `Submission_${student._id}_${safeName}`;
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
      const existingFile = await FileSystem.getInfoAsync(localUri);
      if (existingFile.exists && existingFile.size === 0) {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
      }
      const downloadResult = await FileSystem.downloadAsync(fileUrl, localUri);
      if (!downloadResult || downloadResult.status !== 200) throw new Error("Download failed");
      await new Promise(resolve => setTimeout(resolve, 500));
      return downloadResult.uri;
    } catch (error) { throw error; }
  };

  const handleOpen = async () => {
    if (!fileUrl) return;
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
          data: contentUri, flags: 1, type: getMimeType(),
        });
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileToOpen, { mimeType: getMimeType() });
        }
      }
    } catch (error) {
      Alert.alert('Cannot Open File', 'Please install a compatible app to view this file type.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownload = async () => {
    if (!fileUrl) return;
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
        Alert.alert('Success!', `File saved to your device.`);
      } else {
        await Sharing.shareAsync(localUri, { mimeType: getMimeType() });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save the file.');
    } finally {
      setLoadingAction(null);
    }
  };

  const submitDate = new Date(submission.submittedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <MainLayout title="Student Submission" navigation={navigation} showBack={true} showProfileIcon={false}>
      <View style={styles.container}>
        
        {/* 1. Student Profile Card */}
        <View style={styles.studentCard}>
          {student.profilePhoto ? (
            <Image source={{ uri: student.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {student.name ? student.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{student.name || 'Unknown Student'}</Text>
            <View style={styles.metaRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Class {student.class}</Text>
              </View>
              <Text style={styles.metaText}>SR: {student.srNo}</Text>
            </View>
          </View>
        </View>

        {/* 2. Submission Details */}
        <View style={styles.detailsBox}>
          <Text style={styles.sectionTitle}>Submission Details</Text>
          
          <View style={styles.timeRow}>
            <View style={styles.iconCircle}>
              <Feather name="calendar" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.timeLabel}>Submitted On</Text>
              <Text style={styles.timeValue}>{submitDate}</Text>
            </View>
          </View>

          {/* Attachment Card */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Attached Work</Text>
          
          {fileUrl ? (
            <View style={styles.attachmentCard}>
              {/* LEFT SIDE: Click to Open */}
              <TouchableOpacity 
                style={styles.attachmentClickableArea} 
                activeOpacity={0.7}
                onPress={handleOpen}
                disabled={loadingAction !== null}
              >
                <View style={[styles.fileIconBox, { backgroundColor: fileColor + '15' }]}>
                  {loadingAction === 'open' ? (
                    <ActivityIndicator size="small" color={fileColor} />
                  ) : (
                    <Feather name={fileIcon} size={24} color={fileColor} />
                  )}
                </View>
                
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName} numberOfLines={1}>{displayFileName}</Text>
                  <Text style={styles.attachmentSub}>
                    {loadingAction === 'open' ? 'Opening...' : 'Tap to view file'}
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
          ) : (
            <Text style={styles.noFileText}>Student submitted without an attachment.</Text>
          )}
        </View>

      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  
  // Student Card
  studentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    padding: 20, borderRadius: 20, marginBottom: 20, ...colors.shadow
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: '#f0f0f0' },
  avatarPlaceholder: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: colors.primary },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.text.secondary },
  metaText: { fontSize: 13, color: colors.text.secondary, fontWeight: '600' },

  // Details Box
  detailsBox: { backgroundColor: colors.white, padding: 20, borderRadius: 20, ...colors.shadow },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 16 },
  
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '10', 
    justifyContent: 'center', alignItems: 'center', marginRight: 14 
  },
  timeLabel: { fontSize: 12, color: colors.text.secondary, fontWeight: '600', marginBottom: 2 },
  timeValue: { fontSize: 15, color: colors.text.primary, fontWeight: '700' },

  // Attachment Card
  attachmentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden'
  },
  attachmentClickableArea: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12 },
  fileIconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  attachmentInfo: { flex: 1, paddingRight: 8 },
  attachmentName: { fontSize: 14, fontWeight: '700', color: colors.text.primary, marginBottom: 2 },
  attachmentSub: { fontSize: 12, color: colors.text.secondary },
  downloadButton: { padding: 14, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#e0e0e0' },
  noFileText: { color: colors.error, fontSize: 14, fontStyle: 'italic' }
});

export default ViewStudentSubmissionScreen;