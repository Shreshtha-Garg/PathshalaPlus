import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import colors from '../../constants/colors';
import MainLayout from '../../components/MainLayout';
import api from '../../services/api';

const ViewPostScreen = ({ route, navigation }) => {
  const { post } = route.params;
  
  const [loadingAction, setLoadingAction] = useState(null);
  const [displayFileName, setDisplayFileName] = useState('Attachment');
  const [fileType, setFileType] = useState('unknown');
  const [fileIcon, setFileIcon] = useState('file');
  const [fileColor, setFileColor] = useState(colors.text.secondary);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    if (post.attachmentUrl) {
      // Get filename
      let finalName = "Attachment";
      if (post.attachmentName) {
        finalName = post.attachmentName; 
      } else {
        const extractedName = post.attachmentUrl.split('/').pop().split('?')[0];
        finalName = decodeURIComponent(extractedName);
      }
      setDisplayFileName(finalName);

      // Determine file type and styling
      const url = post.attachmentUrl.toLowerCase();
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
  }, [post.attachmentUrl, post.attachmentName]);

  const getLocalUri = (fileName) => {
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return FileSystem.documentDirectory + `Pathshala_${post._id}_${safeName}`;
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
  // --- DELETE POST LOGIC ---
  const handleDeletePost = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await api.delete(`/teacher/delete-post/${post._id}`);
              
              Alert.alert("Success", "Post deleted successfully.", [
                { text: "OK", onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              const msg = error.response?.data?.message || "Failed to delete post.";
              Alert.alert("Error", msg);
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };
  // Download file with proper error handling
  const downloadFile = async (localUri) => {
    try {
      const downloadUrl = post.attachmentUrl;
      
      console.log('Downloading from:', downloadUrl);
      console.log('Saving to:', localUri);

      // Delete existing file if it has 0 bytes
      const existingFile = await FileSystem.getInfoAsync(localUri);
      if (existingFile.exists && existingFile.size === 0) {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
        console.log('Deleted existing 0-byte file');
      }

      const downloadResult = await FileSystem.downloadAsync(downloadUrl, localUri);
      
      console.log('Download result status:', downloadResult.status);

      if (!downloadResult || !downloadResult.uri) {
        throw new Error("Download failed - no URI returned");
      }

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }

      // Wait for file system to sync
      await new Promise(resolve => setTimeout(resolve, 500));

      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      if (!fileInfo.exists || fileInfo.size === 0) {
        throw new Error("File downloaded but has 0 bytes.");
      }

      return downloadResult.uri;
    } catch (error) {
      console.log('Download error:', error);
      throw error;
    }
  };

  // ACTION 1: OPEN ATTACHMENT
  const handleOpen = async () => {
    if (!post.attachmentUrl) return;
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
        // Use IntentLauncher for better Android compatibility
        const contentUri = await FileSystem.getContentUriAsync(fileToOpen);
        console.log('Opening with content URI:', contentUri);
        
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: getMimeType(),
        });
      } else {
        // iOS: Use sharing
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileToOpen, {
            mimeType: getMimeType(),
            UTI: fileType === 'pdf' ? 'com.adobe.pdf' : fileType === 'image' ? 'public.jpeg' : undefined,
          });
        }
      }
    } catch (error) {
      console.log('Open error:', error);
      
      let message = 'Make sure you have an app installed to open this file type.';
      let storeLink = null;
      
      if (fileType === 'pdf') {
        message = 'Please install a PDF viewer app like Adobe Reader or Google Drive.';
        storeLink = 'market://details?id=com.adobe.reader';
      } else if (fileType === 'document') {
        message = 'Please install Microsoft Word or Google Docs.';
        storeLink = 'market://details?id=com.microsoft.office.word';
      } else if (fileType === 'presentation') {
        message = 'Please install PowerPoint or Google Slides.';
        storeLink = 'market://details?id=com.microsoft.office.powerpoint';
      }

      Alert.alert(
        'Cannot Open File',
        message,
        [
          { text: 'OK' },
          Platform.OS === 'android' && storeLink && {
            text: 'Install App',
            onPress: () => Linking.openURL(storeLink)
          }
        ].filter(Boolean)
      );
    } finally {
      setLoadingAction(null);
    }
  };

  // ACTION 2: DOWNLOAD / SAVE TO DEVICE
  const handleDownload = async () => {
    if (!post.attachmentUrl) return;
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
        if (!permissions.granted) {
          Alert.alert('Permission Denied', 'Please select a folder to save the file.');
          setLoadingAction(null);
          return;
        }

        const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri, 
          displayFileName, 
          getMimeType()
        );

        const fileContent = await FileSystem.readAsStringAsync(localUri, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        
        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          newFileUri, 
          fileContent, 
          { encoding: FileSystem.EncodingType.Base64 }
        );

        // ✅ SUCCESS MESSAGE
        Alert.alert('Success!', `File saved successfully to your selected folder.`);
        
      } else {
        // iOS: Use Share Sheet
        await Sharing.shareAsync(localUri, {
          mimeType: getMimeType(),
          UTI: fileType === 'pdf' ? 'com.adobe.pdf' : undefined,
        });
      }
    } catch (error) {
      console.log('Save error:', error);
      Alert.alert('Error', 'Failed to save the file. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <MainLayout title="Post Details" navigation={navigation} showBack={true} showProfileIcon={false}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Post Header Section */}
        <View style={styles.headerBox}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>{post.type}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.background }]}>
              <Feather name="users" size={12} color={colors.text.secondary} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: colors.text.secondary }]}>Class {post.targetClass}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          
          <Text style={styles.title}>{post.title}</Text>
        </View>

        {/* Post Body */}
        <View style={styles.contentBox}>
          <Text style={styles.description}>{post.description}</Text>
        </View>

        {/* Attachment Section */}
        {post.attachmentUrl && (
          <View style={styles.attachmentSection}>
            <Text style={styles.sectionTitle}>Attachment</Text>
            
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

        {/* --- DELETE POST BUTTON --- */}
        <TouchableOpacity 
          style={styles.deletePostBtn} 
          onPress={handleDeletePost}
          activeOpacity={0.7}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <Feather name="trash-2" size={18} color={colors.error} />
              <Text style={styles.deletePostText}>Delete Post</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  headerBox: {
    backgroundColor: colors.white, padding: 20, borderRadius: 16,
    marginBottom: 16, ...colors.cardShadow,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  dateText: { fontSize: 12, color: colors.text.tertiary, fontWeight: '500', marginLeft: 'auto' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text.primary, lineHeight: 30 },
  
  contentBox: {
    backgroundColor: colors.white, padding: 20, borderRadius: 16,
    marginBottom: 24, ...colors.cardShadow, minHeight: 150,
  },
  description: { fontSize: 16, color: colors.text.secondary, lineHeight: 26 },

  attachmentSection: { marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 12, marginLeft: 4 },
  
  attachmentCard: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.white,
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: '#f0f0f0',
    ...colors.shadow,
    overflow: 'hidden',
  },
  attachmentClickableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  attachmentInfo: { flex: 1, paddingRight: 10 },
  attachmentName: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  attachmentSub: { fontSize: 13, color: colors.text.secondary },
  
  downloadButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  deletePostBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.error , 
    backgroundColor: colors.white,
  },
  deletePostText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  }
});

export default ViewPostScreen;