import React from 'react';
import { View, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import colors from '../constants/colors';

// Import Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import TeacherLoginScreen from '../screens/auth/TeacherLoginScreen';
import StudentLoginScreen from '../screens/auth/StudentLoginScreen';
import SplashScreen from '../screens/SplashScreen';

// Tab Screens
import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
import UpdatesScreen from '../screens/teacher/UpdatesScreen'; 
import ClassListScreen from '../screens/teacher/ClassListScreen'; 
import SettingsScreen from '../screens/teacher/SettingsScreen';

// Deep Stack Screens
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import AddStudentScreen from '../screens/teacher/AddStudentScreen'; 
import PostNoticeScreen from '../screens/teacher/PostNoticeScreen';
import CheckHomeworkScreen from '../screens/teacher/CheckHomeworkScreen';
import ViewProfileScreen from '../screens/teacher/settings/ViewProfileScreen';
import EditProfileScreen from '../screens/teacher/settings/EditProfileScreen';
import AddTeacherScreen from '../screens/teacher/settings/AddTeacherScreen';
import RemoveTeacherScreen from '../screens/teacher/settings/RemoveTeacherScreen';
import AboutPathshalaScreen from '../screens/teacher/settings/AboutPathshalaScreen';
import ClassStudentsScreen from '../screens/teacher/ClassStudentsScreen';
import StudentDetailsScreen from '../screens/teacher/StudentDetailsScreen';
import ViewPostScreen from '../screens/teacher/ViewPostScreen';
import EditStudentScreen from '../screens/teacher/EditStudentScreen';
import HomeworkSubmissionsScreen from '../screens/teacher/HomeworkSubmissionsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TeacherTabs = () => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Updates') iconName = 'message-square'; 
        else if (route.name === 'Students') iconName = 'users';
        else if (route.name === 'Settings') iconName = 'settings';
        
        if (iconName) {
          return <Feather name={iconName} size={24} color={color} />;
        }
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.text.secondary,
      tabBarStyle: {
        height: 80,
        paddingBottom: Platform.OS === 'ios' ? 20 : 20,
        paddingTop: 10,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border || '#f0f0f0',
        elevation: 10, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
      }
    })}
    >
      <Tab.Screen name="Home" component={TeacherHomeScreen} />
      <Tab.Screen name="Updates" component={UpdatesScreen} />
      
      <Tab.Screen 
        name="AddPost" 
        component={View}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('PostNotice');
          },
        }}
        options={{
          tabBarLabel: () => null, 
          tabBarIcon: () => (
            <View style={{
              width: 56, 
              height: 56,
              borderRadius: 28, 
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 14, 
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 5,
              elevation: 6,
            }}>
              <Feather name="plus" size={32} color={colors.white} />
            </View>
          )
        }} 
      />

      <Tab.Screen name="Students" component={ClassListScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash" 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: colors.background } 
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />

        <Stack.Screen name="TeacherRoot" component={TeacherTabs} />
        
        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />

        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
        <Stack.Screen name="PostNotice" component={PostNoticeScreen} /> 
        <Stack.Screen name="CheckHomework" component={CheckHomeworkScreen} />
        <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="AddTeacher" component={AddTeacherScreen} />
        <Stack.Screen name="RemoveTeacher" component={RemoveTeacherScreen} />
        <Stack.Screen name="AboutPathshala" component={AboutPathshalaScreen} />
        <Stack.Screen name="ClassStudents" component={ClassStudentsScreen} />
        <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
        <Stack.Screen name="EditStudent" component={EditStudentScreen} />
        <Stack.Screen name="ViewPost" component={ViewPostScreen} />
        <Stack.Screen name="HomeworkSubmissions" component={HomeworkSubmissionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;