import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import colors from '../../constants/colors';
import MainLayout from '../../components/MainLayout';
import { PremiumInput } from '../../components/PremiumComponents';

const ClassStudentsScreen = ({ route, navigation }) => {
  const { className } = route.params;
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudentsByClass();
  }, []);

  const fetchStudentsByClass = async () => {
    try {
      // Backend automatically sorts by srNo because of { sort: { class: 1, srNo: 1 } }
      const response = await api.get(`/teacher/students?classFilter=${className}`);
      setStudents(response.data);
      setFilteredStudents(response.data);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch students for this class.');
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredStudents(students);
      return;
    }
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(text.toLowerCase()) || 
      s.srNo.includes(text)
    );
    setFilteredStudents(filtered);
  };

  // Change this in src/screens/teacher/ClassStudentsScreen.js
  const renderStudent = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      // NEW: Navigate to StudentDetails and pass the entire student object!
      onPress={() => navigation.navigate('StudentDetails', { student: item })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>Roll No: {item.srNo}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <MainLayout title={`Class ${className}`} navigation={navigation} showBack={true} showProfileIcon={false}>
      <View style={styles.container}>
        
        <PremiumInput 
          placeholder="Search by Name or Roll No..." 
          icon="search" 
          value={search}
          onChangeText={handleSearch}
        />
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList 
            data={filteredStudents}
            keyExtractor={item => item._id}
            renderItem={renderStudent}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No students found in Class {className}.</Text>
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
    // flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    // padding: 15, borderRadius: 12, marginBottom: 12, ...colors.shadow
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
        padding: 20, borderRadius: 16, marginVertical: 6, ...colors.shadow, marginHorizontal: 5
  },
  avatar: {
    width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#e3f2fd',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: colors.text.primary },
  details: { fontSize: 14, color: colors.text.secondary, marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.text.secondary }
});

export default ClassStudentsScreen;