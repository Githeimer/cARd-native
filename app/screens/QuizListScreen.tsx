import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const quizzes = [
  { id: 'quiz1-easy', title: 'Quiz 1', level: 'Easy', category: 'Classification' },
  { id: 'quiz1-med', title: 'Quiz 1', level: 'Medium', category: 'Classification' },
  { id: 'quiz1-hard', title: 'Quiz 1', level: 'Hard', category: 'Classification' },
  { id: 'quiz2-easy', title: 'Quiz 2', level: 'Easy', category: 'Classification' },
  { id: 'quiz2-easy-2', title: 'Quiz 2', level: 'Easy', category: 'Classification' },
];

export default function QuizListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose a Quiz</Text>

      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.quizItem}
            onPress={() => router.push({ pathname: '/screens/quiz/[quizId]', params: { quizId: item.id } })}
          >
            <View>
              <Text style={styles.quizTitle}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <Text style={styles.level}>{item.level}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dcfce7',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  quizItem: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
  },
  level: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
});
