import React, { useEffect, useState, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import styles from './QuizDetailScreen.styles';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/useAuth';
import { Audio } from 'expo-av';

const { height: screenHeight } = Dimensions.get('window');

type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  image_url?: string;
  audio_url?: string;   
  question_type?: string;
  option_type?: string;
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

const audioMap: Record<string, any> = {
  'cow.mp3': require('../../../assets/audio/Cow.mp3'),
  'lion.mp3': require('../../../assets/audio/Lion.mp3'),
  'dog.mp3': require('../../../assets/audio/Dog.mp3'),
  'frog.mp3': require('../../../assets/audio/Frog.mp3'),
};

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [audioUrl]);

  const playAudio = async () => {
    try {
      if (!audioMap[audioUrl]) {
        Alert.alert("Missing Audio", `Audio file for ${audioUrl} not found.`);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.replayAsync();
        setPlaying(true);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(audioMap[audioUrl]);
      soundRef.current = sound;

      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('isLoaded' in status && status.isLoaded && !status.isPlaying) {
          setPlaying(false);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  return (
    <View style={styles.audioPlayerContainer}>
      <TouchableOpacity
        onPress={playAudio}
        style={styles.audioButton}
      >
        <Text style={styles.audioButtonText}>
          {playing ? 'Playing...' : '🔊 Play Audio'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionCreated, setSessionCreated] = useState(false);
  const quizStartTime = useRef<Date>(new Date());
  const questionStartTime = useRef<Date>(new Date());
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wordsSeen, setWordsSeen] = useState<string[]>([]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [isQuizInitializing, setIsQuizInitializing] = useState(true);
  const [forceReload, setForceReload] = useState(0);

  // Reset all quiz state when quizId changes or when screen is focused (fixes replay bug)
  useFocusEffect(
    React.useCallback(() => {
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
      setForceReload(fr => fr + 1); // trigger fetch
    }, [quizId])
  );

  useEffect(() => {
    if (questions.length > 0 && !loading) {
      setIsQuizInitializing(false);
    }
  }, [questions.length, loading]);

  useEffect(() => {
    async function fetchQuizQuestions() {
      setLoading(true);
      // Determine quiz_id and level
      let quiz_id = quizId;
      let level = "Easy";
      // If quizId ends with -easy, -medium, -hard, split and use last part as level
      if (/-easy$|-medium$|-hard$/i.test(quizId)) {
        const parts = quizId.split('-');
        if (parts.length > 1) {
          quiz_id = parts.slice(0, -1).join('-');
          const lvl = parts[parts.length - 1];
          level = lvl.charAt(0).toUpperCase() + lvl.slice(1).toLowerCase();
        }
      }
      console.log('[Quiz] fetchQuizQuestions called', { quiz_id, level, quizId });
      // Try fetching with is_active true and level
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('quiz_id', quiz_id)
        .eq('level', level)
        .eq('is_active', true);
      console.log('[Quiz] fetchQuizQuestions result', { data, error });
      if (!data || data.length === 0) {
        // Try fetching without is_active filter for debugging
        const { data: allData, error: allError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('quiz_id', quiz_id)
          .eq('level', level);
        console.log('[Quiz] fetchQuizQuestions (no is_active filter) result', { allData, allError });
        if (!allData || allData.length === 0) {
          console.log('[Quiz] No data at all for this quiz_id/level', { quiz_id, level, quizId });
          Alert.alert('Error', 'Quiz not found!');
          setQuestions([]);
        } else {
          // Show a warning if is_active is the problem
          Alert.alert('Quiz found but not active', 'There are questions for this quiz, but they are not active. Please check the is_active field in your database.');
          setQuestions([]);
        }
      } else if (error) {
        console.log('[Quiz] Error fetching questions', error);
        Alert.alert('Error', 'Quiz not found!');
        setQuestions([]);
      } else {
        const shuffledQuestions = shuffleArray(data as QuizQuestion[]);
        console.log('[Quiz] Setting questions', shuffledQuestions);
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
          shuffledQuestions.map(q => q.question_text));
        setQuestions(shuffledQuestions);
        setLoading(false);
        setIsQuizInitializing(false);
        return;
      } catch {
        // fallback to fetch
      }
    }
    if (quizId) fetchQuizQuestions();
  }, [quizId, questionsParam, forceReload]);

  useEffect(() => {
    if (questions.length > 0 && !loading) {
      setIsQuizInitializing(false);
    }
  }, [questions.length, loading]);

  useEffect(() => {
    console.log(`Resetting state for question ${currentIdx + 1}/${questions.length}`);
    setSelected(null);
    setFeedback('');
    setAttempts(0);
    setShowHint(false);
    setShowAnswer(false);
    setShowNext(false);
  }, [currentIdx, questions.length]);

  useEffect(() => {
    if (feedback && (selected || showAnswer)) {
      const timer = setTimeout(() => setShowNext(true), 800);
      return () => clearTimeout(timer);
    }
  }, [feedback, selected, showAnswer]);

  useEffect(() => {
    if (user && questions.length && !sessionCreated) {
      startQuiz();
    }
  }, [user, questions, sessionCreated]);

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
    
    setSessionCreated(true);
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
    if (!img) return null;
    const key = img.trim().toLowerCase();
    switch (key) {
      case 'adaptive-icon.png': return require('../../../assets/images/adaptive-icon.png');
      case 'app.png': return require('../../../assets/images/app.png');
      case 'apple.jpg': return require('../../../assets/images/apple.jpg');
      case 'apple2.jpg': return require('../../../assets/images/APPLE2.jpg');
      case 'banana.jpg': return require('../../../assets/images/banana.jpg');
      case 'bath.jpeg': return require('../../../assets/images/bath.jpeg');
      case 'bathtub.jpg': return require('../../../assets/images/BATHtub.jpg');
      case 'bed.jpeg': return require('../../../assets/images/bed.jpeg');
      case 'bedroom.jpg': return require('../../../assets/images/BEDROOM.jpg');
      case 'book.jpg': return require('../../../assets/images/book.jpg');
      case 'brush.jpg': return require('../../../assets/images/BRUSH.jpg');
      case 'brushing.png': return require('../../../assets/images/brushing.png');
      case 'bus.jpeg': return require('../../../assets/images/bus.jpeg');
      case 'car.jpg': return require('../../../assets/images/CAR.jpg');
      case 'chair.jpg': return require('../../../assets/images/chair.jpg');
      case 'classroom.png': return require('../../../assets/images/classroom.png');
      case 'cooking.jpg': return require('../../../assets/images/cooking.jpg');
      case 'cow.jpeg': return require('../../../assets/images/cow.jpeg');
      case 'cycle.jpg': return require('../../../assets/images/CYCLE.jpg');
      case 'cycling.png': return require('../../../assets/images/cycling.png');
      case 'dog.jpeg': return require('../../../assets/images/dog.jpeg');
      case 'eating.jpg': return require('../../../assets/images/EATING.jpg');
      case 'eye.png': return require('../../../assets/images/eye.png');
      case 'farm.jpeg': return require('../../../assets/images/FARM.jpeg');
      case 'farming-tool.jpg': return require('../../../assets/images/FARMING-TOOL.jpg');
      case 'farming.jpg': return require('../../../assets/images/farming.jpg');
      case 'favicon.png': return require('../../../assets/images/favicon.png');
      case 'flying-bird.jpg': return require('../../../assets/images/flying-bird.jpg');
      case 'football.png': return require('../../../assets/images/FOOTBALL.png');
      case 'frog.jpeg': return require('../../../assets/images/frog.jpeg');
      case 'hidden.png': return require('../../../assets/images/hidden.png');
      case 'home.jpg': return require('../../../assets/images/HOME.jpg');
      case 'hospital.jpg': return require('../../../assets/images/hospital.jpg');
      case 'hospital2.jpg': return require('../../../assets/images/hospital2.jpg');
      case 'icon.png': return require('../../../assets/images/icon.png');
      case 'jungle.jpg': return require('../../../assets/images/JUNGLE.jpg');
      case 'kitchen.jpg': return require('../../../assets/images/KITCHEN.jpg');
      case 'lion.jpeg': return require('../../../assets/images/lion.jpeg');
      case 'livingroom.jpg': return require('../../../assets/images/LIVINGROOM.jpg');
      case 'logo.png': return require('../../../assets/images/logo.png');
      case 'logo2.png': return require('../../../assets/images/logo2.png');
      case 'momo.jpg': return require('../../../assets/images/momo.jpg');
      case 'partial-react-logo.png': return require('../../../assets/images/partial-react-logo.png');
      case 'pencil.jpg': return require('../../../assets/images/PENCIL.jpg');
      case 'picnic.png': return require('../../../assets/images/picnic.png');
      case 'playground.png': return require('../../../assets/images/playground.png');
      case 'playing.jpg': return require('../../../assets/images/playing.jpg');
      case 'pngtree-kids-playing-png-image_11365552 1.png': return require('../../../assets/images/pngtree-kids-playing-png-image_11365552 1.png');
      case 'profile.jpg': return require('../../../assets/images/profile.jpg');
      case 'raining.jpg': return require('../../../assets/images/RAINING.jpg');
      case 'reading.jpeg': return require('../../../assets/images/reading.jpeg');
      case 'restaurant.png': return require('../../../assets/images/restaurant.png');
      case 'rice.jpg': return require('../../../assets/images/rice.jpg');
      case 'road.jpg': return require('../../../assets/images/ROAD.jpg');
      case 'school.jpg': return require('../../../assets/images/SCHOOL.jpg');
      case 'shop.jpg': return require('../../../assets/images/SHOP.jpg');
      case 'shoping.jpg': return require('../../../assets/images/shoping.jpg');
      case 'sleeping.jpeg': return require('../../../assets/images/sleeping.jpeg');
      case 'soap.jpeg': return require('../../../assets/images/SOAP.jpeg');
      case 'splash-icon.png': return require('../../../assets/images/splash-icon.png');
      case 'spoon.jpg': return require('../../../assets/images/spoon.jpg');
      case 'swimmingpool.jpg': return require('../../../assets/images/SWIMMINGPOOL.jpg');
      case 'swimtube.jpeg': return require('../../../assets/images/Swimtube.jpeg');
      case 'tiger.jpg': return require('../../../assets/images/TIGER.jpg');
      case 'tree.jpg': return require('../../../assets/images/TREE.jpg');
      case 'tv.jpeg': return require('../../../assets/images/TV.jpeg');
      case 'watching-tv.png': return require('../../../assets/images/watching-tv.png');
      case 'watering.png': return require('../../../assets/images/watering.png');
      case 'writing.png': return require('../../../assets/images/writing.png');
      case 'zoo.png': return require('../../../assets/images/zoo.png');
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
    
    await recordInteraction(
      currentQuestion.question_text, 
      isCorrect, 
      attempts, 
      timeTaken
    );
    
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
  };

  useEffect(() => {
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
  }

  const handleNext = () => {
    questionStartTime.current = new Date();
    setCurrentIdx(currentIdx + 1);
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your quiz...</Text>
      </View>
    );
  }

  // Only show blank if not loading and no questions (quiz not found)
  if (!loading && !questions.length) return null;

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
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIdx + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentIdx + 1} of {Math.min(3, questions.length)}
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          <Text style={styles.question}>{question.question_text}</Text>

          {/* Audio Player (moved above image/options) */}
          {question.question_type === 'audio' && question.audio_url && (
            <AudioPlayer audioUrl={question.audio_url} />
          )}
          
          {/* Question Image(s) */}
          {question.question_type === 'image-multi' && question.image_url ? (
            <View style={styles.multiImageContainer}>
              {(() => {
                try {
                  const imageUrls = JSON.parse(question.image_url);
                  if (Array.isArray(imageUrls) && imageUrls.length >= 2) {
                    return (
                      <>
                        <View style={styles.multiImageWrapper}>
                          <Image source={getImage(imageUrls[0])} style={styles.multiImage} />
                        </View>
                        <Text style={styles.multiImageConnector}>+</Text>
                        <View style={styles.multiImageWrapper}>
                          <Image source={getImage(imageUrls[1])} style={styles.multiImage} />
                        </View>
                      </>
                    );
                  }
                  return null;
                } catch {
                  return null;
                }
              })()}
            </View>
          ) : question.image_url ? (
            <View style={styles.questionImageContainer}>
              <Image source={getImage(question.image_url)} style={styles.questionImage} />
            </View>
          ) : null}

          {/* Options Container */}
          <View style={question.option_type === 'image' ? styles.imageOptionsContainer : styles.textOptionsContainer}>
            {options.map((opt, index) => (
              <TouchableOpacity
                key={opt}
                style={[
                  question.option_type === 'image' ? styles.option : styles.textOption,
                  question.option_type === 'image' && styles.imageOption,
                  selected === opt && opt === question.correct_answer && styles.correctOption,
                  selected === opt && opt !== question.correct_answer && styles.incorrectOption,
                  showAnswer && opt === question.correct_answer && styles.correctOption,
                ]}
                onPress={() => handleSelect(opt)}
                disabled={!!selected || showAnswer}
              >
                {question.option_type === 'image' ? (
                  <View style={styles.imageOptionContent}>
                    <View style={styles.imageOptionImageContainer}>
                      {getImage(opt) ? (
                        <Image source={getImage(opt)} style={styles.optionImage} />
                      ) : (
                        <View style={styles.imageNotFoundContainer}>
                          <Text style={styles.imageNotFoundText}>Image not found</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.textOptionContent}>
                    <View style={styles.optionNumber}>
                      <Text style={styles.optionNumberText}>{String.fromCharCode(65 + index)}</Text>
                    </View>
                    <Text style={styles.optionText}>{opt}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback */}
          {!!feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedback}>{feedback}</Text>
            </View>
          )}

          {/* Hint */}
          {showHint && question.hint && !showAnswer && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintLabel}>💡 Hint</Text>
              <Text style={styles.hintText}>{question.hint}</Text>
            </View>
          )}

          {/* Answer */}
          {showAnswer && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerLabel}>✅ Correct Answer</Text>
              <Text style={styles.answerText}>{question.correct_answer}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      {showNext && currentIdx < questions.length - 1 && (
        <View style={styles.fixedBottomContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <Text style={styles.nextButtonIcon}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ...styles moved to QuizDetailScreen.styles.ts