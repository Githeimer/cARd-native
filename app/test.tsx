// // import React, { useEffect } from 'react';
// // import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// // import { useLocalSearchParams, useRouter } from 'expo-router';
// // import { useAuthContext } from '../auth/AuthProvider';
// // import LoginScreen from './LoginScreen';

// // export default function HomeScreen() {
// //   const params = useLocalSearchParams();
// //   const router = useRouter();
// //   const { user, loading } = useAuthContext();

// //   useEffect(() => {
// //     if (params.oobCode || params.access_token) {
// //       // Redirect to LoginScreen to show password reset form
// //       router.replace({ pathname: '/screens/LoginScreen', params });
// //     }
// //   }, [params.oobCode, params.access_token]);

// //   const handleStart = () => {
// //     if (user) {
// //       router.push('/screens/NextScreen');
// //     } else {
// //       router.push('/screens/LoginScreen');
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// //         <ActivityIndicator size="large" />
// //       </View>
// //     );
// //   }

// // //   if (!user) return <LoginScreen />;

// //   return (
// //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// //       <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 32 }}>Welcome to cARd</Text>
// //       <TouchableOpacity
// //         style={{ backgroundColor: '#2563eb', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 32 }}
// //         onPress={handleStart}
// //       >
// //         <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Start</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // }

// // --------------------------------

// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import { useRouter } from 'expo-router';

// const getGreeting = () => {
//   const hour = new Date().getHours();
//   if (hour < 12) return 'Good morning';
//   if (hour < 18) return 'Good afternoon';
//   return 'Good evening';
// };

// const getDateString = () => {
//   return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
// };

// export default function DashboardScreen() {
//   const router = useRouter();

//   return (
//     <View style={styles.bgWrapper}>
//       {/* Optional: Subtle background pattern or mascot */}
//       {/* <Image source={require('../../assets/images/cool.webp')} style={styles.bgMascot} /> */}
//       <View style={styles.card}>
//         <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
//         <Text style={styles.date}>{getDateString()}</Text>
//         <Text style={styles.title}>Dashboard</Text>
//         <View style={styles.divider} />
//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => router.push('/screens/ProfileScreen')}
//         >
//           <Text style={styles.buttonText}>👤 View Profile</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.button, styles.quizButton]}
//           onPress={() => router.push('/screens/QuizListScreen')}
//         >
//           <Text style={styles.buttonText}>🎮 Start Game</Text>
//         </TouchableOpacity>
//         <Text style={styles.quote}>
//           "Learning is a treasure that will follow its owner everywhere."
//         </Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   bgWrapper: {
//     flex: 1,
//     backgroundColor: '#f0f4ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // bgMascot: {
//   //   position: 'absolute',
//   //   opacity: 0.08,
//   //   width: 320,
//   //   height: 320,
//   //   top: '30%',
//   //   left: '10%',
//   //   zIndex: 0,
//   // },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 28,
//     padding: 32,
//     width: '90%',
//     maxWidth: 400,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 6,
//   },
//   greeting: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#6366f1',
//     marginBottom: 2,
//   },
//   date: {
//     fontSize: 15,
//     color: '#64748b',
//     marginBottom: 10,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginBottom: 18,
//     color: '#1e3a8a',
//     letterSpacing: 1,
//   },
//   divider: {
//     width: '80%',
//     height: 1,
//     backgroundColor: '#e0e7ff',
//     marginBottom: 24,
//   },
//   button: {
//     backgroundColor: '#4f46e5',
//     paddingVertical: 16,
//     paddingHorizontal: 32,
//     borderRadius: 24,
//     marginVertical: 10,
//     width: '100%',
//     alignItems: 'center',
//     shadowColor: '#6366f1',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.12,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   quizButton: {
//     backgroundColor: '#10b981',
//   },
//   buttonText: {
//     fontSize: 20,
//     color: '#fff',
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   quote: {
//     marginTop: 32,
//     fontSize: 15,
//     color: '#64748b',
//     fontStyle: 'italic',
//     textAlign: 'center',
//     opacity: 0.85,
//   },
// });
