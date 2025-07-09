import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabaseClient';

type QuizListItem = {
  id: string;
  title: string;
  category: string;
  level: string;
  quiz_id: string;
};

export default function QuizListScreen() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('quizzes')
        .select('quiz_id, category, level')
        .eq('is_active', true);
      if (error) {
        console.error('Error fetching quizzes:', error);
        setQuizzes([]);
      } else {
        const unique: { [key: string]: QuizListItem } = {};
        data.forEach((item) => {
          const key = `${item.quiz_id}-${item.level}`;
          if (!unique[key]) {
            unique[key] = {
              id: key,
              title: item.quiz_id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              category: item.category,
              level: item.level,
              quiz_id: item.quiz_id,
            };
          }
        });
        setQuizzes(Object.values(unique));
      }
      setLoading(false);
    }
    fetchQuizzes();
  }, []);

  const handleQuizPress = async (item: QuizListItem) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('quiz_id', item.quiz_id)
      .eq('level', item.level)
      .eq('is_active', true);
    setLoading(false);
    if (error || !data || data.length === 0) {
      alert('No questions found for this quiz!');
      return;
    }
    router.push({
      pathname: '/screens/quiz/[quizId]',
      params: { quizId: item.id, questions: JSON.stringify(data) },
    });
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return '#10b981'; // emerald-500
      case 'medium':
        return '#f59e0b'; // amber-500
      case 'hard':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return '#d1fae5'; // emerald-100
      case 'medium':
        return '#fef3c7'; // amber-100
      case 'hard':
        return '#fee2e2'; // red-100
      default:
        return '#f3f4f6'; // gray-100
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading Quizzes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>🧠 Choose Your Quiz</Text>
        <Text style={styles.subheading}>Test your knowledge and learn something new!</Text>
      </View>
      
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.quizCard}
            onPress={() => handleQuizPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={styles.quizInfo}>
                <Text style={styles.quizTitle}>{item.title}</Text>
                <Text style={styles.category}>{item.category}</Text>
              </View>
              
              <View style={[
                styles.levelBadge,
                { backgroundColor: getLevelBgColor(item.level) }
              ]}>
                <Text style={[
                  styles.levelText,
                  { color: getLevelColor(item.level) }
                ]}>
                  {item.level}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardFooter}>
              <Text style={styles.tapToStart}>Tap to start →</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4', // green-50
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#065f46', // green-800
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280', // gray-500
    fontWeight: '400',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Space for navigation bar
  },
  quizCard: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quizInfo: {
    flex: 1,
    marginRight: 16,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827', // gray-900
    marginBottom: 6,
    lineHeight: 26,
  },
  category: {
    fontSize: 15,
    color: '#6b7280', // gray-500
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardFooter: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  tapToStart: {
    fontSize: 14,
    color: '#10b981', // emerald-500
    fontWeight: '600',
    textAlign: 'center',
  },
});