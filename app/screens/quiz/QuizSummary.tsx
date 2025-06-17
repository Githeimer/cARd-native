import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function QuizSummary() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.celebrationContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>
        
        <Text style={styles.title}>Amazing Work!</Text>
        <Text style={styles.subtitle}>
          You've completed the {quizId?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} quiz
        </Text>
        
        <View style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementEmoji}>⭐</Text>
          </View>
          <Text style={styles.achievementText}>
            Every question you answered helps you learn and grow!
          </Text>
        </View>
        
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementText}>
            "Learning is a journey, not a destination. You're doing great!" 
          </Text>
          <Text style={styles.encouragementAuthor}>- Keep up the excellent work! 💪</Text>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace(`/screens/quiz/${quizId}`)}
        >
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.replace('/screens/QuizListScreen')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back to Quiz List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fef9c3',
    justifyContent: 'center',
  },
  celebrationContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef08a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d9f99d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
  },
  encouragementCard: {
    backgroundColor: '#f3e8ff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  encouragementText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#7e22ce',
    marginBottom: 8,
    textAlign: 'center',
  },
  encouragementAuthor: {
    fontSize: 12,
    color: '#9333ea',
    textAlign: 'right',
  },
  actionsContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  secondaryButtonText: {
    color: '#8b5cf6',
  },
});