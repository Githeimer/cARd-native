import { Stack } from "expo-router";
import "./globals.css";
import { AuthProvider } from "./auth/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
          <Stack.Screen name="index" options={{headerShown:false}}/>
          <Stack.Screen name="screens/LoginScreen" options={{headerShown:false}}/>
      </Stack>
    </AuthProvider>
  );
}
