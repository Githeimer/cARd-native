import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthContext } from '../auth/AuthProvider';

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (params.oobCode || params.access_token) {
      router.replace({ pathname: '/screens/LoginScreen', params });
    }
  }, [params.oobCode, params.access_token]);

  const handleStart = () => {
    if (user) {
      router.push('/screens/DashboardScreen');
    } else {
      router.push('/screens/LoginScreen');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mascot or fun image */}
      <Image source={require('../../assets/images/cool.webp')} style={styles.mascot} />
      <Text style={styles.welcomeText}>Welcome to</Text>
      <Text style={styles.title}>cARd</Text>
      <Text style={styles.motto}>Learn words, play games, and have fun!</Text>
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startText}>🚀 Start Learning!</Text>
      </TouchableOpacity>
      <Text style={styles.subText}>🧠 Ready to learn? Tap Start!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fdf6e3', // Soft yellow/cream
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mascot: {
    width: 120,
    height: 120,
    marginBottom: 18,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fbbf24', // playful yellow
    backgroundColor: '#fffbe7',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#f59e42',
    fontFamily: 'Comic Sans MS', // playful font
    marginBottom: 2,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
    fontFamily: 'Comic Sans MS',
    letterSpacing: 2,
  },
  motto: {
    fontSize: 20,
    color: '#10b981',
    marginBottom: 32,
    fontFamily: 'Comic Sans MS',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 22,
    paddingHorizontal: 60,
    borderRadius: 50,
    elevation: 4,
    marginBottom: 18,
    shadowColor: '#f59e42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  startText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Comic Sans MS',
    letterSpacing: 1,
  },
  subText: {
    marginTop: 12,
    fontSize: 18,
    color: '#4b5563',
    fontFamily: 'Comic Sans MS',
    textAlign: 'center',
  },
});
