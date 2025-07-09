import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../supabaseClient';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ProfileScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const lastFetchedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (user && user.id && lastFetchedUserId.current !== user.id) {
      lastFetchedUserId.current = user.id;
      fetchProfileAndMetrics();
    } else if (!user) {
      setLoading(false);
      lastFetchedUserId.current = null;
    }
  }, [user]);

  async function fetchProfileAndMetrics() {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // 1. Fetch profile (card_profiles.id)
    let profileData = null;
    let profileError = null;
    try {
      const { data, error } = await supabase
        .from('card_profiles')
        .select('*')
        .eq('id', user.id)
        .limit(1);
      profileData = data;
      profileError = error;
    } catch (err) {
      profileError = err;
    }
    if (profileError) {
      console.error('Supabase profile fetch error:', profileError);
    }
    setProfile(profileData);    // 2. Fetch sessions (sessions.user_id) - Get sessions with some completion data
    let sessions: Array<any> = [];
    let interactions: Array<any> = [];
    let sessionIds: string[] = [];
    try {
      const { data: sessionRows, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .or('ended_at.not.is.null,correct_count.gt.0,wrong_count.gt.0'); // Get sessions with any completion data
      if (sessionError) console.error('Supabase sessions fetch error:', sessionError);
      if (sessionRows) {
        sessions = sessionRows;
        sessionIds = sessionRows.map((s: any) => s.id);
        console.log('Sessions with activity fetched:', sessions.length);
        console.log('Session details:', sessions.map(s => ({
          id: s.id,
          started_at: s.started_at,
          ended_at: s.ended_at,
          correct_count: s.correct_count,
          wrong_count: s.wrong_count,
          mood: s.mood
        })));
      }
    } catch (err) {
      console.error('Supabase sessions fetch error:', err);
    }
    // 3. Fetch interactions (interactions.session_id in sessionIds)
    try {
      if (sessionIds.length > 0) {
        const { data: interactionRows, error: interactionError } = await supabase
          .from('interactions')
          .select('*')
          .in('session_id', sessionIds);
        if (interactionError) console.error('Supabase interactions fetch error:', interactionError);
        if (interactionRows) interactions = interactionRows;
      }
    } catch (err) {
      console.error('Supabase interactions fetch error:', err);
    }

    // Fallback mock data if empty
    if (!sessions.length) {
      const today = new Date();
      sessions = Array.from({ length: 7 }, (_, i: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return {
          created_at: d.toISOString(),
          correct_count: Math.floor(Math.random() * 10) + 1,
          total_count: 10,
          accuracy: Math.floor(Math.random() * 20) + 80,
          mood: ['😊', '😃', '😅', '🤩', '😴', '😎', '🥳'][i],
          retry_count: Math.random() * 2 + 1,
          avg_time: Math.random() * 20 + 20,
        };
      });
    }
    if (!interactions.length) {
      interactions = sessions.map((s: any) => ({
        avg_time: s.avg_time,
        retry_count: s.retry_count,
      }));
    }    // Metrics calculations as per requirements
    // 1. Accuracy (%)
    const totalCorrect = sessions.reduce((a: number, s: any) => a + (s.correct_count ?? 0), 0);
    const totalWrong = sessions.reduce((a: number, s: any) => a + (s.wrong_count ?? 0), 0);
    const accuracy = (totalCorrect + totalWrong) > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;

    // 2. Total Quizzes Played
    const totalQuizzes = sessions.length;

    // 3. Avg Time per Question - from interactions table
    const validTimes = interactions
      .map((i: any) => Number(i.time_taken_sec))
      .filter((t: number) => !isNaN(t) && t > 0);
    const avgTime = validTimes.length ? (validTimes.reduce((a: number, t: number) => a + t, 0) / validTimes.length) : 0;

    // 4. Avg Retry per Question - from interactions table
    const validRetries = interactions
      .map((i: any) => Number(i.retry_count))
      .filter((r: number) => !isNaN(r) && r >= 0);
    const avgRetry = validRetries.length ? (validRetries.reduce((a: number, r: number) => a + r, 0) / validRetries.length) : 0;    // 5. Weekly Progress (last 7 days, count completed quizzes per day)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today for proper comparison
    const last7Days: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0); // Start of day
      last7Days.push(d.toISOString().slice(0, 10));
    }
    
    console.log('Last 7 days for analysis:', last7Days);
      // Count number of completed quizzes per day
    const quizzesPerDay = last7Days.map(dateStr => {
      const dayQuizzes = sessions.filter((s: any) => {
        // Consider a session "completed" if it has any activity or ended_at
        const hasActivity = (s.correct_count > 0) || (s.wrong_count > 0) || s.ended_at;
        if (!hasActivity) return false;
        
        // Use ended_at if available, fall back to started_at
        const sessionDate = new Date(s.ended_at || s.started_at);
        const sessionDateStr = sessionDate.toISOString().slice(0, 10);
        
        return sessionDateStr === dateStr;
      });
      
      console.log(`${dateStr}: ${dayQuizzes.length} quizzes`, dayQuizzes.map(s => ({
        id: s.id,
        correct: s.correct_count,
        wrong: s.wrong_count,
        ended: !!s.ended_at
      })));
      return dayQuizzes.length;
    });

    // Get correct answers per day for chart subtitle
    const correctPerDay = last7Days.map(dateStr => {
      const dayTotal = sessions
        .filter((s: any) => {
          const hasActivity = (s.correct_count > 0) || (s.wrong_count > 0) || s.ended_at;
          if (!hasActivity) return false;
          const sessionDate = new Date(s.ended_at || s.started_at);
          const sessionDateStr = sessionDate.toISOString().slice(0, 10);
          return sessionDateStr === dateStr;
        })
        .reduce((a: number, s: any) => a + (parseInt(s.correct_count) || 0), 0);
      return dayTotal;
    });
    
    console.log('Quizzes per day:', quizzesPerDay);
    console.log('Correct per day:', correctPerDay);    // 6. Mood Logs (emoji per day, from sessions with mood or activity)
    const moodLogs = last7Days.map(dateStr => {
      const daySessions = sessions
        .filter((s: any) => {
          const hasActivity = (s.correct_count > 0) || (s.wrong_count > 0) || s.ended_at;
          if (!hasActivity) return false;
          const sessionDate = new Date(s.ended_at || s.started_at);
          const sessionDateStr = sessionDate.toISOString().slice(0, 10);
          return sessionDateStr === dateStr;
        })
        .sort((a: any, b: any) => new Date(b.ended_at || b.started_at).getTime() - new Date(a.ended_at || a.started_at).getTime());
      
      if (daySessions.length > 0) {
        // Return mood if available, otherwise a default emoji for activity
        return daySessions[0].mood || '😊';
      }
      return '';
    });

    // 7. 7-day streak (consecutive days with quiz activity, counting backwards from today)
    let streak = 0;
    
    // Start from today and count backwards
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      const checkDateStr = checkDate.toISOString().slice(0, 10);
      
      const hasActivityThisDay = sessions.some((s: any) => {
        const hasActivity = (s.correct_count > 0) || (s.wrong_count > 0) || s.ended_at;
        if (!hasActivity) return false;
        const sessionDate = new Date(s.ended_at || s.started_at);
        const sessionDateStr = sessionDate.toISOString().slice(0, 10);
        return sessionDateStr === checkDateStr;
      });
      
      if (hasActivityThisDay) {
        streak++;
      } else {
        break; // Stop counting if we hit a day without activity
      }
    }setMetrics({
      accuracy,
      totalQuizzes,
      avgTime: Math.round(avgTime * 10) / 10, // Round to 1 decimal place
      avgRetry: Math.round(avgRetry * 10) / 10, // Round to 1 decimal place, keep as number
      quizzesPerDay, // Number of quizzes per day
      correctPerDay, // Correct answers per day
      moodLogs,
      streak,
    });
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0F766E" />
        <Text className="text-lg text-teal-700 mt-4 font-medium">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 px-8">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <Text className="text-4xl mb-4">🔒</Text>
          <Text className="text-xl font-bold text-slate-800 mb-3">Authentication Required</Text>
          <Text className="text-slate-600 text-center mb-6 leading-6">
            Please log in to view your profile and progress metrics.
          </Text>
          <TouchableOpacity
            className="bg-teal-600 px-8 py-4 rounded-xl shadow-md"
            onPress={() => router.push('/screens/LoginScreen')}
          >
            <Text className="text-white font-semibold text-lg">Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Avatar logic
  let avatarSource = require('../../assets/images/profile.jpg');
  if (profile?.avatar_url) {
    avatarSource = { uri: profile.avatar_url };
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header: User Info */}
      {/* <View className="bg-gradient-to-br from-teal-600 to-cyan-600 px-6 pt-12 pb-8 items-center"> */}
      {/* <View className="bg-slate-800 px-6 pt-12 pb-8 items-center"> */}
      <View className="bg-blue-600 px-6 pt-12 pb-8 items-center">
        <View className="w-28 h-28 rounded-full bg-white justify-center items-center mb-4 shadow-lg overflow-hidden">
          <Image source={avatarSource} className="w-24 h-24 rounded-full" resizeMode="cover" />
        </View>
        <Text className="text-xl font-bold text-white mb-2">{profile?.full_name || user.email}</Text>
        <Text className="text-base text-teal-100 mb-2">{profile?.email || user.email}</Text>
        {profile?.role && (
          <View className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mt-2">
            <Text className="text-white font-medium text-sm">{profile.role}</Text>
          </View>
        )}
      </View>
      <View 
    className="absolute bottom-0 left-0 right-0 h-8 bg-slate-50"
    style={{
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    }}
  />
      

      {/* Summary Cards */}
      <View className="flex-row flex-wrap justify-center gap-4 mt-8 px-4">
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-40 h-28 justify-center items-center">
          <Text className="text-3xl mb-2">🎯</Text>
          <Text className="text-xl font-bold text-emerald-600">{metrics?.accuracy ?? 0}%</Text>
          <Text className="text-xs text-slate-500 font-medium">Accuracy</Text>
        </View>
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-40 h-28 justify-center items-center">
          <Text className="text-3xl mb-2">🧪</Text>
          <Text className="text-xl font-bold text-blue-600">{metrics?.totalQuizzes ?? 0}</Text>
          <Text className="text-xs text-slate-500 font-medium">Quizzes Played</Text>
        </View>
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-40 h-28 justify-center items-center">
          <Text className="text-3xl mb-2">⏱️</Text>
          <Text className="text-xl font-bold text-orange-600">{metrics?.avgTime ?? 0}s</Text>
          <Text className="text-xs text-slate-500 font-medium">Avg Time/Question</Text>
        </View>
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 w-40 h-28 justify-center items-center">
          <Text className="text-3xl mb-2">🔁</Text>
          <Text className="text-xl font-bold text-purple-600">{metrics?.avgRetry ?? 0}</Text>
          <Text className="text-xs text-slate-500 font-medium">Avg Retry</Text>
        </View>
      </View>      {/* Weekly Chart Section */}
      <View className="px-4 mt-8">
        <Text className="text-lg font-bold text-slate-800 mb-4">Weekly Activity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full">
          <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" style={{ minWidth: screenWidth + 100 }}>
            <BarChart
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  { 
                    data: metrics?.quizzesPerDay?.length ? metrics.quizzesPerDay : [0,0,0,2,0,0,0],
                    color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})` // Teal for quizzes
                  }
                ],
              }}
              width={screenWidth + 80}
              height={200}
              yAxisLabel=""
              yAxisSuffix=" quiz"
              fromZero={true}
              showValuesOnTopOfBars={true}
              chartConfig={{
                backgroundColor: '#F8FAFC',
                backgroundGradientFrom: '#F8FAFC',
                backgroundGradientTo: '#F1F5F9',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
                style: { borderRadius: 16 },
                propsForBackgroundLines: { stroke: '#E2E8F0' },
                propsForLabels: { fontSize: 14, fontWeight: '500' },
              }}
              style={{ borderRadius: 16, marginHorizontal: 8 }}
            />
            <View className="mt-4 px-4">
              <Text className="text-sm text-slate-600 text-center leading-5">
                Quizzes completed per day (Total: {metrics?.quizzesPerDay?.reduce((a: number, b: number) => a + b, 0) || 0})
              </Text>
              {metrics?.correctPerDay && (
                <Text className="text-sm text-emerald-600 text-center mt-1 font-medium">
                  {metrics.correctPerDay.reduce((a: number, b: number) => a + b, 0)} correct answers this week
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>{/* Mood and Streak Section */}
      <View className="px-4 mt-8">
        <View className="flex-row justify-center items-center gap-3 mb-4">
          <Text className="text-lg font-bold text-slate-800">
            <Text>🔥 Streak: </Text>
          </Text>
          <Text className="text-lg font-bold text-orange-600">{metrics?.streak ?? 0} days</Text>
        </View>
        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <Text className="text-sm font-semibold text-slate-700 mb-4 text-center">Daily Mood Tracker</Text>
          <View className="flex-row justify-around items-center">
            {metrics?.moodLogs?.map((mood: string, i: number) => (
              <View key={i} className="items-center">
                <View className="w-12 h-12 bg-slate-100 rounded-full justify-center items-center mb-2">
                  <Text className="text-2xl">{mood || '😐'}</Text>
                </View>
                <Text className="text-xs text-slate-500 font-medium">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</Text>
              </View>
            ))}
          </View>
          <Text className="text-xs text-slate-500 text-center mt-4">
            How you felt each day (😐 = no quiz completed)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}