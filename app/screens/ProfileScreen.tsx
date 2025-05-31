import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthContext } from '../auth/AuthProvider';

export default function ProfileScreen() {
  const { user } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>

      {user ? (
        <>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user.id}</Text>
        </>
      ) : (
        <Text style={styles.value}>Not logged in</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e8ff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#6d28d9',
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
  },
  note: {
    marginTop: 24,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
