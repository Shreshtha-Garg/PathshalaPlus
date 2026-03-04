  import React from 'react';
  import { View, Platform } from 'react-native';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import { NavigationContainer, useNavigation } from '@react-navigation/native';
  import { Feather } from '@expo/vector-icons';
  import colors from '../constants/colors';

  // --- AUTH & COMMON SCREENS ---
  import SubmitHomeworkScreen from '../screens/student/homework/SubmitHomeworkScreen';
  import SplashScreen from '../screens/SplashScreen';
  import WelcomeScreen from '../screens/WelcomeScreen';
  import TeacherLoginScreen from '../screens/auth/TeacherLoginScreen';
  import StudentLoginScreen from '../screens/auth/StudentLoginScreen';

  // --- TEACHER SCREENS ---
  import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
  import UpdatesScreen from '../screens/teacher/UpdatesScreen'; 
  import ClassListScreen from '../screens/teacher/ClassListScreen'; 
  import SettingsScreen from '../screens/teacher/SettingsScreen';
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
  import EditStudentScreen from '../screens/teacher/EditStudentScreen';
  import ViewPostScreen from '../screens/teacher/ViewPostScreen';
  import HomeworkSubmissionsScreen from '../screens/teacher/HomeworkSubmissionsScreen';
  import ViewStudentSubmissionScreen from '../screens/teacher/ViewStudentSubmissionScreen';

  // --- STUDENT SCREENS (NEW STRUCTURE) ---
  import StudentHomeScreen from '../screens/student/dashboard/StudentHomeScreen';
  import StudentUpdatesScreen from '../screens/student/dashboard/StudentUpdatesScreen';
  import HomeworkListScreen from '../screens/student/homework/HomeworkListScreen';
  import StudentProfileScreen from '../screens/student/profile/StudentProfileScreen';

  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();

  // ==========================================
  // TEACHER TAB NAVIGATION
  // ==========================================
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
            return <Feather name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel
        })}
      >
        <Tab.Screen name="Home" component={TeacherHomeScreen} />
        <Tab.Screen name="Updates" component={UpdatesScreen} />
        <Tab.Screen 
          name="AddPost" 
          component={View}
          listeners={{ tabPress: (e) => { e.preventDefault(); navigation.navigate('PostNotice'); } }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <View style={styles.floatingButton}>
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

  // ==========================================
  // STUDENT TAB NAVIGATION (NEW)
  // ==========================================
  const StudentTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Homework') iconName = 'book-open'; 
            else if (route.name === 'Updates') iconName = 'bell';
            else if (route.name === 'Profile') iconName = 'user';
            return <Feather name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: colors.cardIndigo || colors.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel
        })}
      >
        <Tab.Screen name="Home" component={StudentHomeScreen} />
        <Tab.Screen name="Homework" component={HomeworkListScreen} />
        <Tab.Screen name="Updates" component={StudentUpdatesScreen} />
        <Tab.Screen name="Profile" component={StudentProfileScreen} />
      </Tab.Navigator>
    );
  };

  // ==========================================
  // MAIN APP NAVIGATION
  // ==========================================
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
          {/* Auth & Roots */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
          <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
          <Stack.Screen name="TeacherRoot" component={TeacherTabs} />
          <Stack.Screen name="StudentRoot" component={StudentTabs} />

          {/* Shared / Common Screens */}
          <Stack.Screen name="ViewPost" component={ViewPostScreen} />
          <Stack.Screen name="SubmitHomework" component={SubmitHomeworkScreen} />

          {/* Teacher Only Screens */}
          <Stack.Screen name="AddStudent" component={AddStudentScreen} />
          <Stack.Screen name="PostNotice" component={PostNoticeScreen} /> 
          <Stack.Screen name="CheckHomework" component={CheckHomeworkScreen} />
          <Stack.Screen name="HomeworkSubmissions" component={HomeworkSubmissionsScreen} />
          <Stack.Screen name="ClassStudents" component={ClassStudentsScreen} />
          <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
          <Stack.Screen name="EditStudent" component={EditStudentScreen} />
          <Stack.Screen name="ViewStudentSubmission" component={ViewStudentSubmissionScreen} />
          {/* Settings Stack */}
          <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="AddTeacher" component={AddTeacherScreen} />
          <Stack.Screen name="RemoveTeacher" component={RemoveTeacherScreen} />
          <Stack.Screen name="AboutPathshala" component={AboutPathshalaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };

  const styles = {
    tabBar: {
      height: 80,
      paddingBottom: Platform.OS === 'ios' ? 20 : 20,
      paddingTop: 10,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      elevation: 10, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    tabBarLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 4,
    },
    floatingButton: {
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
    }
  };

  export default AppNavigator;