import { AuthProvider } from "./auth/AuthProvider";
import BottomTabs from "./BottomTabs";
import "./globals.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <BottomTabs />
    </AuthProvider>
  );
}
