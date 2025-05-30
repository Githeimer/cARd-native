import HomeScreen from "./screens/home";
import { AuthProvider } from './auth/AuthProvider';

export default function Index() {
  return (
    <AuthProvider>
      <HomeScreen />
    </AuthProvider>
  );
}
