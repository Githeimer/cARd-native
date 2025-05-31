import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  resetPasswordWithEmail,
  updatePasswordWithOobCode
} from '../auth';
import styles from './loginScreenStyles';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGuest, setShowGuest] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [showPasswordResetForm, setShowPasswordResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetPasswordMsg, setResetPasswordMsg] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();

  React.useEffect(() => {
    if (params.oobCode) {
      const code = Array.isArray(params.oobCode) ? params.oobCode[0] : params.oobCode;
      setOobCode(code);
      setShowPasswordResetForm(true);
    }
  }, [params.oobCode]);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg('Please enter your first and last name.');
        return;
      }
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password, { firstName, lastName, phone });
        if (error) throw error;
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
        // No successMsg, just return to login
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        router.replace('/screens/DashboardScreen');
      }
    } catch (error) {
      let errMsg = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        errMsg = (error as any).message;
      } else if (typeof error === 'string') {
        errMsg = error;
      } else {
        try { errMsg = JSON.stringify(error); } catch { /* ignore */ }
      }
      setErrorMsg(String(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      let errMsg = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        errMsg = (error as any).message;
      } else if (typeof error === 'string') {
        errMsg = error;
      } else {
        try { errMsg = JSON.stringify(error); } catch { /* ignore */ }
      }
      setErrorMsg(String(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setShowGuest(true);
  };

  const resetApp = () => {
    setShowGuest(false);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setConfirmPassword('');
    setIsSignUp(false);
  };

  // --- Password Reset Handlers ---
  const handleShowReset = () => {
    setShowReset(true);
    setResetEmail('');
    setResetMsg('');
    setErrorMsg('');
  };

  const handleResetPassword = async () => {
    setResetMsg('');
    setErrorMsg('');
    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your email to reset password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await resetPasswordWithEmail(resetEmail.trim());
      if (error) throw error;
      setResetMsg('Password reset email sent! Please check your inbox.');
    } catch (error) {
      let errMsg = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        errMsg = (error as any).message;
      } else if (typeof error === 'string') {
        errMsg = error;
      } else {
        try { errMsg = JSON.stringify(error); } catch { /* ignore */ }
      }
      setErrorMsg(String(errMsg));
    } finally {
      setLoading(false);
    }
  };

  // Handler for submitting new password after clicking email link
  const handleSetNewPassword = async () => {
    setErrorMsg('');
    setResetPasswordMsg('');
    if (!newPassword || !confirmNewPassword) {
      setErrorMsg('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await updatePasswordWithOobCode(oobCode, newPassword);
      if (error) throw error;
      setResetPasswordMsg('Password updated! You can now log in.');
      // Sign out after password reset to force re-login
      await signOut();
      setTimeout(() => {
        setShowPasswordResetForm(false);
        setResetPasswordMsg('');
        router.replace('/screens/LoginScreen');
      }, 1500);
    } catch (error) {
      let errMsg = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        errMsg = (error as any).message;
      } else if (typeof error === 'string') {
        errMsg = error;
      } else {
        try { errMsg = JSON.stringify(error); } catch { /* ignore */ }
      }
      setErrorMsg(String(errMsg));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.overlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginLeft: 12, color: '#374151' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (showGuest) {
    return (
      <View style={[styles.centeredBox, { paddingHorizontal: 16 }]}> 
        <Text style={{ fontSize: 64, marginBottom: 10 }}>👋</Text>
        <Text style={[styles.successTitle, { fontSize: 30, marginBottom: 8 }]}>Welcome, Guest!</Text>
        <Text style={[styles.successMsg, { fontSize: 18, marginBottom: 22, color: '#334155' }]}>You're using the app without an account</Text>
        <View style={[styles.guestAlertBox, { marginBottom: 28, padding: 18 }]}> 
          <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 4 }}>⚠️</Text>
          <Text style={[styles.guestAlertText, { fontSize: 17 }]}>Your progress and achievements won't be saved</Text>
        </View>
        <TouchableOpacity style={[styles.guestStartBtn, { width: '100%', maxWidth: 320, marginBottom: 16, paddingVertical: 18 }]} onPress={resetApp}>
          <Text style={[styles.guestStartBtnText, { fontSize: 20 }]}>Start Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.guestCreateBtn, { width: '100%', maxWidth: 320, borderWidth: 1, borderColor: '#2563eb', backgroundColor: '#f1f5f9' }]} onPress={resetApp}>
          <Text style={[styles.guestCreateBtnText, { fontSize: 18 }]}>Create Account Instead</Text>
        </TouchableOpacity>
        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 18, textAlign: 'center' }}>
          Guest mode is for quick access only. To save your progress, achievements, and sync across devices, create a free account!
        </Text>
      </View>
    );
  }

  if (showReset) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <Text style={{ color: '#64748b', fontSize: 16, marginBottom: 18, textAlign: 'center' }}>
              Enter your email address and we'll send you a password reset link.
            </Text>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
            {resetMsg ? <Text style={styles.successMsg}>{resetMsg}</Text> : null}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword}>
              <Text style={styles.primaryBtnText}>Send Reset Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 18 }} onPress={() => setShowReset(false)}>
              <Text style={{ color: '#2563eb', fontSize: 16, textAlign: 'center' }}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (showPasswordResetForm) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.headerTitle}>Set New Password</Text>
            <Text style={{ color: '#64748b', fontSize: 16, marginBottom: 18, textAlign: 'center' }}>
              Enter your new password below to complete the reset process.
            </Text>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
            {resetPasswordMsg ? <Text style={styles.successMsg}>{resetPasswordMsg}</Text> : null}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSetNewPassword}>
              <Text style={styles.primaryBtnText}>Set New Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>📖</Text>
            <Text style={styles.headerTitle}>Word Learning</Text>
            <Text style={styles.headerSubtitle}>Track progress and learn new words</Text>
          </View>

          {/* Login/Signup Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, !isSignUp && styles.toggleBtnActive]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.toggleBtnText, !isSignUp && styles.toggleBtnTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, isSignUp && styles.toggleBtnActive]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.toggleBtnText, isSignUp && styles.toggleBtnTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Personal Information Section (for Sign Up) */}
            {isSignUp && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="First name"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.nameField}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Last name"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
                <Text style={styles.label}>Phone Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            {/* Account Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isSignUp ? 'Account Details' : 'Login to Your Account'}
              </Text>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              
              <Text style={styles.label}>Password</Text>
              <View style={{ position: 'relative', justifyContent: 'center' }}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, height: '100%', justifyContent: 'center', alignItems: 'center', width: 44 }}
                  onPress={() => setShowPassword((prev) => !prev)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Image
                    source={showPassword ? require('../../assets/images/hidden.png') : require('../../assets/images/eye.png')}
                    style={{ width: 22, height: 22, tintColor: '#64748b' }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              
              {isSignUp && (
                <>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={{ position: 'relative', justifyContent: 'center' }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="new-password"
                    />
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 0, top: 0, bottom: 0, height: '100%', justifyContent: 'center', alignItems: 'center', width: 44 }}
                      onPress={() => setShowConfirmPassword((prev) => !prev)}
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Image
                        source={showConfirmPassword ? require('../../assets/images/hidden.png') : require('../../assets/images/eye.png')}
                        style={{ width: 22, height: 22, tintColor: '#64748b' }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* Error Message */}
            {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

            {/* Primary Action Button */}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
              <Text style={styles.primaryBtnText}>
                {isSignUp ? 'Create Account' : 'Login'}
              </Text>
            </TouchableOpacity>
            {/* Forgot Password Link (Login only) */}
            {!isSignUp && (
              <TouchableOpacity style={{ marginTop: 16, alignSelf: 'center' }} onPress={handleShowReset}>
                <Text style={{ color: '#2563eb', fontSize: 16 }}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Alternative Authentication */}
          <View style={styles.altAuthSection}>
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth}>
              <Text style={styles.googleIcon}>🔍</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Guest Mode */}
            <View style={styles.guestSection}>
              <TouchableOpacity onPress={handleGuestMode}>
                <Text style={styles.guestBtnText}>Continue as Guest</Text>
              </TouchableOpacity>
              <Text style={styles.guestHint}>Limited features, no progress tracking</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}