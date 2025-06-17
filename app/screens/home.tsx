import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
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
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>स्वागत छ</Text>
        <Text style={styles.title}>cARd</Text>
        <Text style={styles.motto}>शब्दहरू सिकौं, रमाईलो गरौं!</Text>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <View style={styles.buttonContent}>
            <Text style={styles.startIcon}></Text>
            <Text style={styles.startText}>सुरु गरौं 🚀</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.subText}>सिक्न तयार हुनु भयो?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF', // calm light blue
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#0F172A', // deep gray
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 56,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0284C7', // sky blue
    letterSpacing: -1,
  },
  motto: {
    fontSize: 18,
    color: '#10B981', // emerald green
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#0284C7', // sky blue
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 32,
    elevation: 6,
    marginBottom: 24,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    minWidth: 200,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  startText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
});
