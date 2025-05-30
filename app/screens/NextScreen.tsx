import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../supabaseClient';
import { useAuthContext } from '../auth/AuthProvider';

const NextScreen = () => {
  const { user } = useAuthContext();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>This is the Next Screen!</Text>
      <TouchableOpacity
        style={{ backgroundColor: '#ef4444', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24, marginTop: 24 }}
        onPress={handleSignOut}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NextScreen;
