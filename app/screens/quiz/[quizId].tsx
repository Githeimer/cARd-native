import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/useAuth';

type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  image_url?: string;
  options: string[] | string;
  correct_answer: string;
  category?: string;
  level?: string;
  is_active?: boolean;
  created_at?: string;
  hint?: string;
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const successFeedbacks = [
  '✅ Correct! Great job!',
  '🎉 Well done!',
  '👏 You got it!',
  '🌟 Awesome!',
];

export default function QuizDetailScreen() {
  const { user } = useAuth();
  const { quizId, questions: questionsParam } = useLocalSearchParams<{ quizId: string, questions?: string | string[] }>();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showNext, setShowNext] = useState(false);
  // New states for session tracking
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionCreated, setSessionCreated] = useState(false);
  const quizStartTime = useRef<Date>(new Date());
  const questionStartTime = useRef<Date>(new Date());
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);  const [wordsSeen, setWordsSeen] = useState<string[]>([]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [isQuizInitializing, setIsQuizInitializing] = useState(true);

  // Reset all quiz state when quizId changes (new quiz starting)
  useEffect(() => {
    setIsQuizInitializing(true);
    setCurrentIdx(0);
    setSelected(null);
    setFeedback('');
    setAttempts(0);
    setShowHint(false);
    setShowAnswer(false);
    setShowNext(false);
    setShowMoodPicker(false);
    setSessionId(null);
    setSessionCreated(false);
    setCorrectCount(0);
    setWrongCount(0);
    setWordsSeen([]);
    setLoading(true);
    quizStartTime.current = new Date();
    questionStartTime.current = new Date();
  }, [quizId]);

  // When questions are loaded, clear initializing flag
  useEffect(() => {
    if (questions.length > 0 && !loading) {
      setIsQuizInitializing(false);
    }
  }, [questions.length, loading]);

  useEffect(() => {
    async function fetchQuizQuestions() {
      setLoading(true);
      const [quiz_id, ...levelParts] = quizId.split('-');
      const level = levelParts.join('-');      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('quiz_id', quiz_id)
        .eq('level', level)        .eq('is_active', true);      
      
      if (error || !data || data.length === 0) {
        Alert.alert('Error', 'Quiz not found!');
        setQuestions([]);      } else {
        const shuffledQuestions = shuffleArray(data as QuizQuestion[]);
        setQuestions(shuffledQuestions);
      }
      setLoading(false);
    }
    if (questionsParam) {
      let param: string = '';
      if (typeof questionsParam === 'string') param = questionsParam;
      else if (Array.isArray(questionsParam)) param = questionsParam[0];
      try {
        const parsed: QuizQuestion[] = JSON.parse(param);
        const shuffledQuestions = shuffleArray(parsed);
        console.log(`Loaded ${shuffledQuestions.length} questions from params:`, 
          shuffledQuestions.map(q => q.question_text));        setQuestions(shuffledQuestions);
        setLoading(false);
        // Clear initializing flag when questions are loaded
        setIsQuizInitializing(false);
        return;
      } catch {
        // fallback to fetch
      }
    }
    if (quizId) fetchQuizQuestions();
  }, [quizId, questionsParam]);

  // Clear initializing flag when questions are loaded from database
  useEffect(() => {
    if (questions.length > 0 && !loading) {
      setIsQuizInitializing(false);
    }
  }, [questions.length, loading]);useEffect(() => {
    console.log(`Resetting state for question ${currentIdx + 1}/${questions.length}`);
    setSelected(null);
    setFeedback('');
    setAttempts(0);
    setShowHint(false);
    setShowAnswer(false);
    setShowNext(false);
  }, [currentIdx, questions.length]);useEffect(() => {
    if (feedback && (selected || showAnswer)) {
      const timer = setTimeout(() => setShowNext(true), 800);
      return () => clearTimeout(timer);
    }
  }, [feedback, selected, showAnswer]);

  // Remove the competing navigation logic - let mood picker handle the end// Start session when user and questions loaded
  useEffect(() => {
    if (user && questions.length && !sessionCreated) {
      startQuiz();
    }
  }, [user, questions, sessionCreated]);

  // Initialize question timer when quiz starts
  useEffect(() => {
    if (questions.length > 0) {
      questionStartTime.current = new Date();
    }
  }, [questions]);
  const startQuiz = async () => {
    if (!user || sessionCreated) {
      if (!user) console.log('Guest user - skipping session tracking');
      return;
    }
    
    setSessionCreated(true); // Prevent multiple calls
    quizStartTime.current = new Date();
    questionStartTime.current = new Date();
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{ 
          user_id: user.id, 
          started_at: quizStartTime.current,
          words_seen: []
        }])
        .select('id')
        .single();
      
      if (error) {
        console.error('Session start error:', error);
        setSessionCreated(false);
      } else {
        setSessionId(data.id);
        console.log('Session started:', data.id);
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      setSessionCreated(false);
    }
  };

  const recordInteraction = async (word: string, wasCorrect: boolean, retryCount: number, timeTakenSec: number) => {
    if (!sessionId || !user) return;
    
    try {
      const { error } = await supabase
        .from('interactions')
        .insert([{
          session_id: sessionId,
          word: word,
          time_taken_sec: timeTakenSec,
          was_correct: wasCorrect,
          retry_count: retryCount,
          interaction_at: new Date()
        }]);
      
      if (error) {
        console.error('Interaction insert error:', error);
      }
    } catch (err) {
      console.error('Failed to record interaction:', err);
    }
  };

  const getImage = (img?: string) => {
    switch (img) {
      case 'apple.png':
      case 'apple.jpg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\apple.jpg');
      case 'bus.png':
      case 'bus.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\bus.jpeg');
      case 'chair.png':
      case 'chair.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\chair.jpg');
      case 'bed.png':
      case 'bed.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\bed.jpeg');
      
      case 'hospital.png':
      case 'hospital.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\hospital.jpg');
      case 'momo.jpg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\momo.jpg');
      case 'playground.png':
      case 'playground.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\playground.png');
      case 'restaurant.png':
      case 'restaurant.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\restaurant.png');
      case 'soap.png':
      case 'soap.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\soap.jpg');
      case 'sleeping.png':
      case 'sleeping.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\sleeping.jpeg');
      case 'reading.png':
      case 'reading.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\reading.jpeg');
      case 'bath.png':
      case 'bath.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\bath.jpeg');
      case 'playing.png':
      case 'playing.jpg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\playing.jpg');
      case 'soap.png':
      case 'soap.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\soap.jpg');
      case 'rice.png':
      case 'rice.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\rice.jpg');
      case 'book.png':
      case 'book.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\book.jpg');
      case 'spoon.png':
      case 'spoon.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\spoon.jpg');
      case 'banana.png':
      case 'banana.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\banana.jpg');
      case 'toothbrush.png':
      case 'toothbrush.jpeg':
        return require('C:\\Coding\\cARd\\final-app\\cARd-native\\assets\\images\\toothbrush.jpg');

      default:
        return null;
    }
  };
  const handleSelect = async (option: string) => {
    if (selected) return;
    setSelected(option);
    
    const now = new Date();
    const timeTaken = (now.getTime() - questionStartTime.current.getTime()) / 1000;
    const isCorrect = option === questions[currentIdx]?.correct_answer;
    const currentQuestion = questions[currentIdx];
    
    // Record interaction in database
    await recordInteraction(
      currentQuestion.question_text, 
      isCorrect, 
      attempts, 
      timeTaken
    );
    
    // Update local counters
    setWordsSeen(ws => {
      const newWords = [...ws];
      if (!newWords.includes(currentQuestion.question_text)) {
        newWords.push(currentQuestion.question_text);
      }
      return newWords;
    });
    
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      const msg = successFeedbacks[Math.floor(Math.random() * successFeedbacks.length)];
      setFeedback(msg);
    } else {
      setWrongCount(w => w + 1);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts === 1) {
        setFeedback("That's okay! Try again! 🌟");
        setTimeout(() => {
          setSelected(null);
          setFeedback('');
        }, 1200);
      } else if (newAttempts === 2) {
        setFeedback("Keep going! Want a hint?");
        setShowHint(true);
        setTimeout(() => {
          setSelected(null);
          setFeedback('');
        }, 1500);
      } else if (newAttempts >= 3) {
        setFeedback("Here's the answer! You can do it next time!");
        setShowAnswer(true);
      }
    }
  };
  const endQuiz = async (chosenMood: string) => {
    if (!sessionId || !user) {
      // For guest users, skip DB update and go to summary
      router.replace({ pathname: './QuizSummary', params: { quizId } });
      return;
    }
    
    const endTime = new Date();
    const durationSec = (endTime.getTime() - quizStartTime.current.getTime()) / 1000;
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          ended_at: endTime, 
          duration_sec: Math.round(durationSec),
          correct_count: correctCount, 
          wrong_count: wrongCount,
          words_seen: wordsSeen, 
          mood: chosenMood
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('Session update error:', error);
      } else {
        console.log('Session completed successfully');
      }
    } catch (err) {
      console.error('Failed to end session:', err);
    }
    
    router.replace({ pathname: './QuizSummary', params: { quizId } });
  };  // Show mood picker at end
  useEffect(() => {
    // Only trigger mood picker when ALL conditions are met:
    // 1. showNext is true (user finished answering current question)
    // 2. We're on the last question (currentIdx === questions.length - 1)
    // 3. We have questions loaded (questions.length > 0)
    // 4. User has actually interacted with this question (selected || showAnswer)
    // 5. Quiz is not loading (!loading)
    // 6. User has made actual progress (correctCount + wrongCount > 0)
    // 7. Quiz is not initializing (!isQuizInitializing)
    // 8. We have a valid current index and question count match
    const isOnLastQuestion = currentIdx === questions.length - 1;
    const hasValidQuestionIndex = currentIdx >= 0 && currentIdx < questions.length;
    const hasUserInteraction = selected || showAnswer;
    const hasProgress = correctCount + wrongCount > 0;
    const isQuizReady = !loading && !isQuizInitializing && questions.length > 0;
    if (
      showNext &&
      isOnLastQuestion &&
      hasValidQuestionIndex &&
      hasUserInteraction &&
      hasProgress &&
      isQuizReady
    ) {
      setShowMoodPicker(true);
    }
  }, [showNext, currentIdx, questions.length, selected, showAnswer, feedback, loading, correctCount, wrongCount, isQuizInitializing]);

  useEffect(() => {
    return () => {
      if (sessionId && !showMoodPicker && correctCount + wrongCount > 0) {
        console.log('Auto-completing session on component unmount');
        supabase
          .from('sessions')
          .update({ 
            ended_at: new Date(), 
            duration_sec: Math.round((new Date().getTime() - quizStartTime.current.getTime()) / 1000),
            correct_count: correctCount, 
            wrong_count: wrongCount,
            words_seen: wordsSeen, 
            mood: '😊' 
          })
          .eq('id', sessionId)
          .then(({ error }: { error: any }) => {
            if (error) console.error('Auto-complete session error:', error);
            else console.log('Session auto-completed');
          });
      }
    };
  }, [sessionId, showMoodPicker, correctCount, wrongCount, wordsSeen]);
  if (showMoodPicker) {
    return (
      <View style={styles.moodContainer}>
        <View style={styles.moodCard}>
          <Text style={styles.moodTitle}>How did that feel? 💭</Text>
          <Text style={styles.moodSubtitle}>Your feelings help us learn too!</Text>
          <View style={styles.moodGrid}>
            {['😊','😃','😅','🤩','😴','😎','🥳'].map((emo) => (
              <TouchableOpacity key={emo} onPress={() => endQuiz(emo)} style={styles.emojiButton}>
                <Text style={styles.emoji}>{emo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }  // Reset question timer on next
  const handleNext = () => {
    questionStartTime.current = new Date();
    setCurrentIdx(currentIdx + 1);
  };  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={styles.loadingText}>Loading your quiz...</Text>
    </View>
  );
  if (!questions.length) return null;

  const question = questions[currentIdx];
  if (!question) return null;

  let options: string[] = [];
  if (question && question.options) {
    if (Array.isArray(question.options)) options = question.options;
    else if (typeof question.options === 'string') {
      try {
        options = JSON.parse(question.options);
      } catch {
        options = question.options.split(',');
      }
    }
  }  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIdx + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>          <Text style={styles.progressText}>
            Question {currentIdx + 1} of {Math.min(3, questions.length)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>
          <Text style={styles.question}>{question.question_text}</Text>
          
          {question.image_url && (
            <View style={styles.imageContainer}>
              <Image source={getImage(question.image_url)} style={styles.image} />
            </View>
          )}

          <View style={styles.optionsContainer}>
            {options.map((opt, index) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.option,
                  selected === opt && opt === question.correct_answer && styles.correctOption,
                  selected === opt && opt !== question.correct_answer && styles.incorrectOption,
                  showAnswer && opt === question.correct_answer && styles.correctOption,
                ]}
                onPress={() => handleSelect(opt)}
                disabled={!!selected || showAnswer}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionNumber}>
                    <Text style={styles.optionNumberText}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <Text style={styles.optionText}>{opt}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {!!feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedback}>{feedback}</Text>
            </View>
          )}

          {showHint && question.hint && !showAnswer && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintLabel}>💡 Hint</Text>
              <Text style={styles.hintText}>{question.hint}</Text>
            </View>
          )}

          {showAnswer && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerLabel}>✅ Correct Answer</Text>
              <Text style={styles.answerText}>{question.correct_answer}</Text>
            </View>
          )}
        </View>

        {showNext && currentIdx < questions.length - 1 && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Continue</Text>
              <Text style={styles.nextButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerContainer: {
    padding: 24,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  contentCard: {
    flex: 1,
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1E293B',
    lineHeight: 32,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#F8FAFC',
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionNumberText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  correctOption: {
    backgroundColor: '#DCFCE7',
    borderColor: '#059669',
  },
  incorrectOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  feedback: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
  },
  hintContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 16,
    color: '#92400E',
    lineHeight: 24,
  },
  answerContainer: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 16,
    color: '#047857',
    fontWeight: '500',
    lineHeight: 24,
  },
  navigationContainer: {
    padding: 24,
    paddingTop: 0,
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  nextButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Mood Picker Styles
  moodContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  moodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  moodTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  moodSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  emojiButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
  },
});