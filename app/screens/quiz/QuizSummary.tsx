import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function QuizSummary() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main celebration card */}
        <View style={styles.celebrationCard}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          
          <Text style={styles.title}>Great Work!</Text>
          <Text style={styles.subtitle}>
            You completed the {quizId?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} quiz
          </Text>
          
          {/* Achievement badges */}
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🏆</Text>
              <Text style={styles.badgeText}>Quiz Master</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🌟</Text>
              <Text style={styles.badgeText}>Super Learner</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>🎯</Text>
              <Text style={styles.badgeText}>Sharp Thinker</Text>
            </View>
          </View>
          
          {/* Encouragement message */}
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              "Learning is like playing - the more you do it, the better you get!" 
            </Text>
            <Text style={styles.messageAuthor}>Keep up the awesome work! 💪</Text>
          </View>
        </View>
        
        {/* Fun facts section */}
        <View style={styles.funFactsCard}>
          <View style={styles.funFactsHeader}>
            <Text style={styles.funFactsEmoji}>🎪</Text>
            <Text style={styles.funFactsTitle}>Did You Know?</Text>
          </View>
          <Text style={styles.funFactsText}>
            Your brain creates new connections every time you learn something new! 🧠✨
          </Text>
        </View>
        
        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.replace(`/screens/quiz/${quizId}`)}
          >
            <Text style={styles.primaryButtonText}>🎮 Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.replace('/screens/QuizListScreen')}
          >
            <Text style={styles.secondaryButtonText}>🏠 Back to Quizzes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  celebrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
    lineHeight: 22,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  badge: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  messageText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#1D4ED8',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageAuthor: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'right',
    fontWeight: '600',
  },
  funFactsCard: {
    backgroundColor: '#FEFCE8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  funFactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  funFactsEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  funFactsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#CA8A04',
  },
  funFactsText: {
    fontSize: 14,
    color: '#A16207',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
});