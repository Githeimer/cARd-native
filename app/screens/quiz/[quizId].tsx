import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Import quiz data statically
import quizData from 'C:/Coding/cARd/final-app/cARd-native/assets/quizzes/classification_quiz.json';

export default function QuizDetailScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const [question, setQuestion] = useState<any | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const found = quizData.find((q) => q.id === quizId);
    if (found) {
      setQuestion(found);
    } else {
      Alert.alert('Error', 'Quiz not found!');
    }
  }, [quizId]);

  const getImage = (filename: string) => {
    switch (filename) {
      case 'apple.png':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\apple.jpg');
      case 'bus.png':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\bus.jpeg');
      default:
        return null;
    }
  };

  const handleSelect = (option: string) => {
    setSelected(option);
    const isCorrect = option === question.answer;
    setFeedback(isCorrect ? '✅ Correct!' : '❌ Try again');
  };

  if (!question) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz: {quizId}</Text>
      <Text style={styles.question}>{question.question}</Text>

      <Image source={getImage(question.image)} style={styles.image} />

      {question.options.map((opt: string) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.option,
            selected === opt && opt === question.answer && styles.correct,
            selected === opt && opt !== question.answer && styles.incorrect,
          ]}
          onPress={() => handleSelect(opt)}
        >
          <Text style={styles.optionText}>{opt}</Text>
        </TouchableOpacity>
      ))}

      {feedback !== '' && (
        <Text style={styles.feedback}>{feedback}</Text>
      )}
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    color: '#7c3aed',
  },
  question: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  optionText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  correct: {
    backgroundColor: '#bbf7d0',
  },
  incorrect: {
    backgroundColor: '#fecaca',
  },
  feedback: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
  },
});
