import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../services/api';
import colors from '../../../constants/colors';
import MainLayout from '../../../components/MainLayout';

const RemoveTeacherScreen = ({ navigation }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teacher/all-teachers');
      setTeachers(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not fetch teacher list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      "Remove Teacher?",
      `Are you sure you want to remove ${name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/teacher/delete-teacher/${id}`);
              setTeachers(prev => prev.filter(t => t._id !== id));
              Alert.alert("Success", "Teacher removed successfully.");
            } catch (err) {
              Alert.alert("Error", "Could not remove teacher.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        <View style={styles.avatar}>
             <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.role}>{item.role}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDelete(item._id, item.name)}
      >
        <Feather name="trash-2" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <MainLayout title="Remove Teacher" navigation={navigation} showBack={true}>
      <View style={styles.container}>
        {loading ? (
           <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
           <FlatList 
             data={teachers}
             keyExtractor={item => item._id}
             renderItem={renderItem}
             contentContainerStyle={{ paddingBottom: 20 }}
             ListEmptyComponent={
                <Text style={styles.emptyText}>No other teachers found.</Text>
             }
           />
        )}
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: colors.white, padding: 15, borderRadius: 16, marginBottom: 12, ...colors.shadow 
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { 
    width: 45, height: 45, borderRadius: 23, backgroundColor: '#f0f9ff', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  name: { fontSize: 16, fontWeight: 'bold', color: colors.text.primary },
  email: { fontSize: 12, color: colors.text.secondary },
  role: { fontSize: 10, color: colors.primary, marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },
  deleteBtn: { padding: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.text.secondary }
});

export default RemoveTeacherScreen;