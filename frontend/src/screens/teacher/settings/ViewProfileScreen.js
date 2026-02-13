import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';

const ViewProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/me').then(res => {
      setUser(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Custom Read-Only Field Component
  const ReadOnlyField = ({ label, value, icon }) => (
    <View style={styles.fieldContainer}>
      <View style={styles.iconBox}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "Not Provided"}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;

  return (
    <MainLayout title="My Profile" navigation={navigation} showBack={true}>
      <View style={styles.container}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Image 
            source={{ uri: user?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
            <ReadOnlyField label="Full Name" value={user?.name} icon="user" />
            <View style={styles.divider} />
            <ReadOnlyField label="Email Address" value={user?.email} icon="mail" />
            <View style={styles.divider} />
            <ReadOnlyField label="Mobile Number" value={user?.mobile} icon="smartphone" />
            <View style={styles.divider} />
            <ReadOnlyField label="Account Role" value={user?.role} icon="shield" />
        </View>

      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, backgroundColor: '#f0f0f0' },
  name: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
  role: { fontSize: 16, color: colors.primary, fontWeight: '600', marginTop: 5 },
  
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, ...colors.shadow },
  
  fieldContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textGroup: { flex: 1 },
  label: { fontSize: 12, color: colors.text.secondary, marginBottom: 2 },
  value: { fontSize: 16, color: colors.text.primary, fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 55 }
});

export default ViewProfileScreen;