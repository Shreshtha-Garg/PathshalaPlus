import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AddStudentScreen from '../screens/teacher/AddStudentScreen'; // 
import PostNoticeScreen from '../screens/teacher/PostNoticeScreen';

// Import Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import TeacherLoginScreen from '../screens/auth/TeacherLoginScreen';
import StudentLoginScreen from '../screens/auth/StudentLoginScreen';
import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
import StudentHomeScreen from '../screens/student/StudentHomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome" 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' } 
        }}
      >
        
        {/* --- Public Screens --- */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />

        {/* --- Protected Screens (After Login) --- */}
        <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
        <Stack.Screen name="PostNotice" component={PostNoticeScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;