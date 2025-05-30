import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../auth/AuthProvider';
import LoginScreen from './LoginScreen';

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  const handleStart = () => {
    if (user) {
      router.push('/screens/NextScreen');
    } else {
      router.push('/screens/LoginScreen');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

//   if (!user) return <LoginScreen />;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 32 }}>Welcome to cARd</Text>
      <TouchableOpacity
        style={{ backgroundColor: '#2563eb', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 32 }}
        onPress={handleStart}
      >
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}