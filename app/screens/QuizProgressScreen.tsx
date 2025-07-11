import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

type QuizHistoryItem = {
  quiz_id: string;
  category: string;
  type: string;
  score: number;
  total: number;
  accuracy: number;
  time_spent: string;
  last_attempt: string;
};

export default function QuizProgress() {
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const data = await AsyncStorage.getItem('quizHistory');
        setHistory(data ? JSON.parse(data) : []);
      } catch (e) {
        setHistory([]);
      }
      setLoading(false);
    }
    loadHistory();
  }, []);

  // Prepare chart data
  const accuracyData = history.map((h, index) => ({
    date: new Date(h.last_attempt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    accuracy: h.accuracy,
    index: index + 1,
  }));

  const categoryScores: { [category: string]: number[] } = {};
  history.forEach((h) => {
    if (!categoryScores[h.category]) categoryScores[h.category] = [];
    categoryScores[h.category].push(h.score);
  });
  const barData = Object.keys(categoryScores).map((cat) => ({
    category: cat,
    avgScore:
      categoryScores[cat].reduce((a: number, b: number) => a + b, 0) /
      categoryScores[cat].length,
  }));

  const typeCounts: { [type: string]: number } = {};
  history.forEach((h) => {
    typeCounts[h.type] = (typeCounts[h.type] || 0) + 1;
  });
  const pieData = Object.keys(typeCounts).map((type, index) => ({
    name: type,
    count: typeCounts[type],
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'][index % 6],
    legendFontColor: '#2C3E50',
    legendFontSize: 13,
  }));

  const calculateStreak = () => {
    if (history.length === 0) return 0;
    
    const dates = history.map(h => new Date(h.last_attempt).toDateString()).reverse();
    const uniqueDates = [...new Set(dates)];
    
    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = currentDate.toDateString();
      if (uniqueDates.includes(checkDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Generate comprehensive insights for parents
  const generateInsights = () => {
    if (history.length === 0) return null;
    
    const insights = [];
    const recentAttempts = history.slice(-5);
    const avgRecentAccuracy = recentAttempts.reduce((sum, h) => sum + h.accuracy, 0) / recentAttempts.length;
    
    // Performance insights
    if (avgRecentAccuracy >= 90) {
      insights.push({
        emoji: '🌟',
        title: 'Excellent Performance!',
        description: 'Your child is mastering concepts with 90%+ accuracy',
        color: '#10b981',
        bgColor: '#f0fdf4'
      });
    } else if (avgRecentAccuracy >= 75) {
      insights.push({
        emoji: '📈',
        title: 'Great Progress!',
        description: 'Steady improvement with strong understanding',
        color: '#3b82f6',
        bgColor: '#eff6ff'
      });
    } else if (avgRecentAccuracy >= 60) {
      insights.push({
        emoji: '💪',
        title: 'Keep Going!',
        description: 'Building confidence through consistent practice',
        color: '#f59e0b',
        bgColor: '#fffbeb'
      });
    } else {
      insights.push({
        emoji: '🎯',
        title: 'Focus Time!',
        description: 'Consider reviewing topics that need more attention',
        color: '#ef4444',
        bgColor: '#fef2f2'
      });
    }
    
    // Learning pattern insights
    const strongestCategory = Object.keys(categoryScores).reduce((a, b) => 
      (categoryScores[a].reduce((x, y) => x + y, 0) / categoryScores[a].length) > 
      (categoryScores[b].reduce((x, y) => x + y, 0) / categoryScores[b].length) ? a : b
    );
    
    if (strongestCategory) {
      insights.push({
        emoji: '🏆',
        title: 'Strong Subject Area',
        description: `Excellent performance in ${strongestCategory}`,
        color: '#8b5cf6',
        bgColor: '#faf5ff'
      });
    }
    
    // Consistency insights
    const totalAttempts = history.length;
    if (totalAttempts >= 10) {
      insights.push({
        emoji: '⭐',
        title: 'Consistent Learner',
        description: `${totalAttempts} quiz attempts show dedication to learning`,
        color: '#06b6d4',
        bgColor: '#f0f9ff'
      });
    }
    
    return insights;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>📊 Learning Progress</Text>
      <Text style={styles.subtitle}>Track your child's educational journey and achievements</Text>
    </View>
  );

  const renderParentSummary = () => {
    if (history.length === 0) return null;
    
    const totalAttempts = history.length;
    const avgAccuracy = history.reduce((sum, h) => sum + h.accuracy, 0) / totalAttempts;
    const recentAttempts = history.slice(-5);
    const recentAccuracy = recentAttempts.reduce((sum, h) => sum + h.accuracy, 0) / recentAttempts.length;
    const improvement = recentAccuracy - avgAccuracy;
    const streakDays = calculateStreak();
    
    let strongestCategory = '';
    if (Object.keys(categoryScores).length > 0) {
      strongestCategory = Object.keys(categoryScores).reduce((a, b) => 
        (categoryScores[a].reduce((x, y) => x + y, 0) / categoryScores[a].length) > 
        (categoryScores[b].reduce((x, y) => x + y, 0) / categoryScores[b].length) ? a : b
      );
    }
    
    return (
      <View style={styles.parentSummary}>
        <Text style={styles.parentSummaryTitle}>�‍👩‍👧‍👦 Parent Dashboard</Text>
        <Text style={styles.parentSummarySubtitle}>Your child's learning progress at a glance</Text>
        <View style={styles.parentSummaryContent}>
          <View style={styles.parentSummaryRow}>
            <Text style={styles.parentSummaryLabel}>📊 Overall Performance:</Text>
            <Text style={[styles.parentSummaryValue, { color: avgAccuracy >= 80 ? '#10b981' : avgAccuracy >= 60 ? '#f59e0b' : '#ef4444' }]}>
              {avgAccuracy >= 80 ? 'Excellent' : avgAccuracy >= 60 ? 'Good Progress' : 'Needs Support'}
            </Text>
          </View>
          
          {strongestCategory && (
            <View style={styles.parentSummaryRow}>
              <Text style={styles.parentSummaryLabel}>🎯 Strongest Subject:</Text>
              <Text style={styles.parentSummaryValue}>{strongestCategory}</Text>
            </View>
          )}
          
          <View style={styles.parentSummaryRow}>
            <Text style={styles.parentSummaryLabel}>🔥 Learning Streak:</Text>
            <Text style={[styles.parentSummaryValue, { color: streakDays >= 3 ? '#10b981' : '#6b7280' }]}>
              {streakDays} {streakDays === 1 ? 'day' : 'days'}
            </Text>
          </View>
          
          {improvement > 5 && (
            <View style={styles.parentSummaryRow}>
              <Text style={styles.parentSummaryLabel}>📈 Recent Trend:</Text>
              <Text style={[styles.parentSummaryValue, { color: '#10b981' }]}>
                Improving (+{Math.round(improvement)}%)
              </Text>
            </View>
          )}
          
          <View style={styles.parentSummaryRow}>
            <Text style={styles.parentSummaryLabel}>🕒 Total Activity:</Text>
            <Text style={styles.parentSummaryValue}>
              {totalAttempts} quiz{totalAttempts > 1 ? 'es' : ''} completed
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSummaryStats = () => {
    if (history.length === 0) return null;
    
    const totalAttempts = history.length;
    const avgAccuracy = history.reduce((sum, h) => sum + h.accuracy, 0) / totalAttempts;
    const totalCorrect = history.reduce((sum, h) => sum + h.score, 0);
    const totalQuestions = history.reduce((sum, h) => sum + h.total, 0);
    
    // Calculate learning streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const recentDays = history.filter(h => {
      const attemptDate = new Date(h.last_attempt).toDateString();
      return attemptDate === today || attemptDate === yesterday;
    }).length;
    
    // Calculate improvement trend
    const recentAccuracy = history.slice(-3).reduce((sum, h) => sum + h.accuracy, 0) / Math.min(3, history.length);
    const olderAccuracy = history.slice(0, -3).reduce((sum, h) => sum + h.accuracy, 0) / Math.max(1, history.length - 3);
    const improvement = recentAccuracy - olderAccuracy;
    
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>📊 Quick Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statNumber}>{Math.round(avgAccuracy)}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statNumber}>{totalAttempts}</Text>
            <Text style={styles.statLabel}>Total Quizzes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>{totalCorrect}</Text>
            <Text style={styles.statLabel}>Correct Answers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>{recentDays}</Text>
            <Text style={styles.statLabel}>Recent Activity</Text>
          </View>
        </View>
        
        {improvement > 5 && (
          <View style={styles.improvementBadge}>
            <Text style={styles.improvementText}>📈 +{Math.round(improvement)}% improvement recently!</Text>
          </View>
        )}
      </View>
    );
  };

  const renderInsights = () => {
    const insights = generateInsights();
    if (!insights || insights.length === 0) return null;
    
    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>💡 Learning Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={[styles.insightCard, { backgroundColor: insight.bgColor }]}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightEmoji}>{insight.emoji}</Text>
              <Text style={[styles.insightTitle, { color: insight.color }]}>{insight.title}</Text>
            </View>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderAchievements = () => {
    if (history.length === 0) return null;
    
    const achievements = [];
    const totalAttempts = history.length;
    const avgAccuracy = history.reduce((sum, h) => sum + h.accuracy, 0) / totalAttempts;
    const perfectScores = history.filter(h => h.accuracy === 100).length;
    const categories = [...new Set(history.map(h => h.category))];
    
    // Achievement badges
    if (totalAttempts >= 5) achievements.push({ emoji: '🎯', title: 'Quiz Explorer', desc: `Completed ${totalAttempts} quizzes` });
    if (totalAttempts >= 10) achievements.push({ emoji: '🏃‍♂️', title: 'Learning Runner', desc: 'Completed 10+ quizzes' });
    if (totalAttempts >= 20) achievements.push({ emoji: '🌟', title: 'Quiz Master', desc: 'Completed 20+ quizzes' });
    if (avgAccuracy >= 80) achievements.push({ emoji: '🎓', title: 'High Achiever', desc: `${Math.round(avgAccuracy)}% average accuracy` });
    if (avgAccuracy >= 90) achievements.push({ emoji: '🏆', title: 'Excellence Award', desc: 'Consistently high performance' });
    if (perfectScores >= 3) achievements.push({ emoji: '💯', title: 'Perfect Scorer', desc: `${perfectScores} perfect scores` });
    if (categories.length >= 3) achievements.push({ emoji: '🎨', title: 'Well-Rounded', desc: `Learning across ${categories.length} subjects` });
    
    const streakDays = calculateStreak();
    if (streakDays >= 3) achievements.push({ emoji: '🔥', title: 'Learning Streak', desc: `${streakDays} days in a row` });
    
    if (achievements.length === 0) return null;
    
    return (
      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>🏆 Achievements Unlocked</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsList}>
          {achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementBadge}>
              <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.desc}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const renderAttemptCard = ({ item }: { item: QuizHistoryItem }) => {
    // Dynamic colors based on accuracy
    const getAccuracyColor = (accuracy: number) => {
      if (accuracy >= 80) return { bg: '#f0fdf4', border: '#bbf7d0', text: '#10b981' };
      if (accuracy >= 60) return { bg: '#fffbeb', border: '#fde68a', text: '#f59e0b' };
      return { bg: '#fef2f2', border: '#fecaca', text: '#ef4444' };
    };

    const colors = getAccuracyColor(item.accuracy);

    return (
      <View style={styles.attemptCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardCategory}>📚 {item.category}</Text>
          <View style={[styles.cardAccuracy, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.cardAccuracyText, { color: colors.text }]}>
              {item.accuracy}%
            </Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardDetail}>🎯 Type: {item.type}</Text>
          <Text style={styles.cardDetail}>✅ Score: {item.score} / {item.total}</Text>
          <Text style={styles.cardDetail}>⏱ Time: {item.time_spent}</Text>
          <Text style={styles.cardDetail}>📅 Date: {new Date(item.last_attempt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}</Text>
        </View>
      </View>
    );
  };

  const renderCharts = () => {
    if (history.length === 0) return null;
    
    return (
      <View style={styles.chartsContainer}>
        <Text style={styles.sectionTitle}>📊 Progress Charts</Text>
        
        {history.length >= 2 && (
          <>
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Accuracy Over Time</Text>
              <LineChart
                data={{
                  labels: accuracyData.slice(-6).map((a) => a.date),
                  datasets: [{ 
                    data: accuracyData.slice(-6).map((a) => a.accuracy),
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                    strokeWidth: 4
                  }],
                }}
                width={screenWidth - 32}
                height={200}
                chartConfig={chartConfig}
                style={styles.chart}
                bezier
              />
            </View>
          </>
        )}
        
        {Object.keys(categoryScores).length > 1 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Average Score by Category</Text>
            <BarChart
              data={{
                labels: barData.map((b) => b.category.slice(0, 8)),
                datasets: [{ data: barData.map((b) => Math.round(b.avgScore * 10) / 10) }],
              }}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              showValuesOnTopOfBars={true}
            />
          </View>
        )}
        
        {Object.keys(typeCounts).length > 1 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Quiz Type Distribution</Text>
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={200}
              chartConfig={chartConfig}
              accessor={'count'}
              backgroundColor={'transparent'}
              paddingLeft={'15'}
              style={styles.chart}
              center={[10, 0]}
              hasLegend={true}
            />
          </View>
        )}
        
        {history.length < 2 && (
          <View style={styles.fallbackChart}>
            <Text style={styles.fallbackText}>
              📈 Not enough quiz data to show progress yet.
            </Text>
            <Text style={styles.fallbackSubtext}>
              Complete more quizzes to see detailed progress charts!
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz progress...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>Ready to Start Learning?</Text>
          <Text style={styles.emptyText}>
            Take your first quiz to begin tracking your amazing learning journey! 
            We'll show you detailed progress reports and achievements here.
          </Text>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => router.push('/screens/QuizListScreen')}
          >
            <Text style={styles.startButtonText}>Start Learning Adventure →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {renderParentSummary()}
          {renderSummaryStats()}
          {renderInsights()}
          {renderAchievements()}
          
          <View style={styles.attemptsContainer}>
            <Text style={styles.sectionTitle}>🎯 Recent Attempts</Text>
            <FlatList
              data={history.slice(-10).reverse()}
              keyExtractor={(_, i) => i.toString()}
              renderItem={renderAttemptCard}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attemptsList}
            />
          </View>
          
          {renderCharts()}
        </>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#f8fafc',
  backgroundGradientFromOpacity: 1,
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  strokeWidth: 3,
  barPercentage: 0.8,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  propsForDots: {
    r: '8',
    strokeWidth: '3',
    stroke: '#4A90E2',
    fill: '#ffffff',
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#e5e7eb',
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 12,
    fontWeight: '600',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  summaryContainer: {
    margin: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  improvementBadge: {
    backgroundColor: '#10b981',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
    alignSelf: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  improvementText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  insightsContainer: {
    margin: 20,
    marginTop: 10,
  },
  insightCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  insightDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 36,
  },
  attemptsContainer: {
    margin: 20,
    marginTop: 10,
  },
  attemptsList: {
    paddingRight: 20,
  },
  attemptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginRight: 16,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardCategory: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    flex: 1,
  },
  cardAccuracy: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardAccuracyText: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardContent: {
    gap: 10,
  },
  cardDetail: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  chartsContainer: {
    margin: 20,
    marginTop: 10,
  },
  chartSection: {
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  fallbackChart: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  fallbackText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  fallbackSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Remove old styles that are no longer needed
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightContainer: {
    margin: 20,
    marginTop: 10,
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  insightText: {
    fontSize: 16,
    color: '#0369a1',
    fontWeight: '600',
    lineHeight: 22,
  },
  // Achievement styles
  achievementsContainer: {
    margin: 20,
    marginTop: 10,
  },
  achievementsList: {
    paddingRight: 20,
  },
  achievementBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    minWidth: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Parent summary styles
  parentSummary: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  parentSummaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  parentSummarySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  parentSummaryContent: {
    gap: 12,
  },
  parentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parentSummaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    flex: 1,
  },
  parentSummaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '700',
    textAlign: 'right',
  },
});