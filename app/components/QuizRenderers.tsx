import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export type QuestionType = 'text' | 'image' | 'audio';
export type OptionType = 'text' | 'image';
export type QuizStrategy = 'repetition' | 'association' | 'classification';

export interface QuizOption {
  id: string;
  value: string; // text or image url
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: QuestionType;
  question_media_url?: string; // for image/audio
  option_type: OptionType;
  options: QuizOption[];
  correct_answer: string;
  quiz_strategy?: QuizStrategy;
}

interface QuestionRendererProps {
  question: QuizQuestion;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  switch (question.question_type) {
    case 'text':
      return (
        <Text style={styles.questionText}>{question.question_text}</Text>
      );
    case 'image':
      return (
        <View style={styles.questionImageContainer}>
          {question.question_media_url && (
            <Image source={{ uri: question.question_media_url }} style={styles.questionImage} resizeMode="contain" />
          )}
          {question.question_text ? (
            <Text style={styles.questionText}>{question.question_text}</Text>
          ) : null}
        </View>
      );
    case 'audio':
      return (
        <View style={styles.questionAudioContainer}>
          {/* Replace with your audio player component */}
          <Text style={styles.questionText}>[Audio Player Placeholder]</Text>
          {question.question_text ? (
            <Text style={styles.questionText}>{question.question_text}</Text>
          ) : null}
        </View>
      );
    default:
      return null;
  }
};

interface OptionRendererProps {
  option: QuizOption;
  optionType: OptionType;
  selected?: boolean;
  onSelect: (optionId: string) => void;
}

export const OptionRenderer: React.FC<OptionRendererProps> = ({ option, optionType, selected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={() => onSelect(option.id)}
      activeOpacity={0.85}
    >
      {optionType === 'text' ? (
        <Text style={styles.optionText}>{option.value}</Text>
      ) : (
        <Image source={{ uri: option.value }} style={styles.optionImage} resizeMode="contain" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  questionImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  questionAudioContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  optionButtonSelected: {
    backgroundColor: '#E0E7FF',
    borderColor: '#6366F1',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  optionImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
});
