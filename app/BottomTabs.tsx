// import React from 'react';
// import { Tabs } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// export default function BottomTabs() {
//   return (
//     <Tabs
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ color, size, focused }) => {
//           let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
//           if (route.name === 'index') {
//             iconName = focused ? 'home' : 'home-outline';
//           } else if (route.name === 'screens/QuizListScreen') {
//             iconName = focused ? 'extension-puzzle' : 'extension-puzzle-outline';
//           } else if (route.name === 'screens/ProfileScreen') {
//             iconName = focused ? 'person' : 'person-outline';
//           } else if (route.name === 'screens/DashboardScreen') {
//             iconName = focused ? 'bar-chart' : 'bar-chart-outline';
//           }
          
//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#f59e0b', // Amber color to match app theme
//         tabBarInactiveTintColor: '#9ca3af', // Gray
//         tabBarLabelStyle: { 
//           fontSize: 12, 
//           fontWeight: '600',
//           marginBottom: 4,
//         },
//         tabBarStyle: {
//           backgroundColor: '#fffbeb', // Light amber background
//           borderTopWidth: 1,
//           borderTopColor: '#fde68a',
//           height: 65,
//           paddingTop: 8,
//           paddingBottom: 8,
//         },
//         headerShown: false,
//       })}
//     >
//       <Tabs.Screen 
//         name="index" 
//         options={{ 
//           title: 'Home',
//           tabBarLabel: 'Home',
//         }} 
//       />
//       <Tabs.Screen 
//         name="screens/QuizListScreen" 
//         options={{ 
//           title: 'Quiz',
//           tabBarLabel: 'Quiz',
//         }} 
//       />
//       <Tabs.Screen 
//         name="screens/ProfileScreen" 
//         options={{ 
//           title: 'Profile',
//           tabBarLabel: 'Profile',
//         }} 
//       />
//       <Tabs.Screen 
//         name="screens/DashboardScreen" 
//         options={{ 
//           title: 'Dashboard',
//           tabBarLabel: 'Dashboard',
//         }} 
//       />
//       {/* Hide other screens from tab bar */}
//       <Tabs.Screen 
//         name="screens/LoginScreen" 
//         options={{ 
//           href: null, // This hides it from the tab bar
//         }} 
//       />
//       <Tabs.Screen 
//         name="BottomTabs" 
//         options={{ 
//           href: null, // This hides it from the tab bar
//         }} 
//       />
//       <Tabs.Screen 
//         name="screens/home" 
//         options={{ 
//           href: null, // This hides it from the tab bar
//         }} 
//       />
//       <Tabs.Screen 
//         name="screens/NextScreen" 
//         options={{ 
//           href: null, // This hides it from the tab bar
//         }} 
//       />
//       <Tabs.Screen 
//         name="screens/loginScreenStyles" 
//         options={{ 
//           href: null, // This hides it from the tab bar
//         }} 
//       />
//       <Tabs.Screen 
//         name="screens/quiz/[quizId]" 
//         options={{ 
//           href: null, // This hides it from the tab bar
//         }} 
//       />
//       <Tabs.Screen 
//         name="screens/quiz/QuizSummary" 
//         options={{ 
//           href: null, // This hides it from the tab bar
//         }} 
//       />
//     </Tabs>
        
//   );
// }

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BottomTabs() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'screens/QuizListScreen') {
            iconName = focused ? 'extension-puzzle' : 'extension-puzzle-outline';
          } else if (route.name === 'screens/ProfileScreen') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'screens/DashboardScreen') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5', // Indigo primary
        tabBarInactiveTintColor: '#94A3B8', // Slate gray
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '600',
          marginBottom: 6,
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(248, 250, 252, 0.95)', // Semi-transparent background
          borderTopWidth: 1,
          borderTopColor: 'rgba(226, 232, 240, 0.8)', // Subtle border
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          paddingHorizontal: 16,
          position: 'absolute',
          backdropFilter: 'blur(20px)', // Glass effect (iOS)
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          marginHorizontal: 4,
          borderRadius: 12,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarLabel: 'Home',
        }} 
      />
      <Tabs.Screen 
        name="screens/QuizListScreen" 
        options={{ 
          title: 'Quiz',
          tabBarLabel: 'Quiz',
        }} 
      />
      <Tabs.Screen 
        name="screens/ProfileScreen" 
        options={{ 
          title: 'Profile',
          tabBarLabel: 'Profile',
        }} 
      />
      <Tabs.Screen 
        name="screens/DashboardScreen" 
        options={{ 
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }} 
      />
      {/* Hide other screens from tab bar */}
      <Tabs.Screen 
        name="screens/LoginScreen" 
        options={{ 
          href: null, // This hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="BottomTabs" 
        options={{ 
          href: null, // This hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="screens/home" 
        options={{ 
          href: null, // This hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="screens/NextScreen" 
        options={{ 
          href: null, // This hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="screens/loginScreenStyles" 
        options={{ 
          href: null, // This hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="screens/quiz/[quizId]" 
        options={{ 
          href: null, // This hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="screens/quiz/QuizSummary" 
        options={{ 
          href: null, // This hides it from the tab bar
        }} 
      />
    </Tabs>
        
  );
}