import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Radius } from '../../theme/tokens';
import { useAuthStore } from '../../store/authStore';
import type { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export function OnboardingWelcomeScreen({ navigation }: Props) {
  const setOnboardingDone = useAuthStore(s => s.setOnboardingDone);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>🌙</Text>
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>안녕하세요!</Text>
          <Text style={styles.subtitle}>
            생리주기를 기록하면 Luna가{'\n'}다음 생리일과 배란일을{'\n'}예측해 드려요.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Date')}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => setOnboardingDone(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>지금은 건너뛸게요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: { fontSize: 48 },
  textWrap: { alignItems: 'center' },
  title: {
    fontSize: 40,
    fontFamily: 'NotoSansKR_900Black',
    color: Colors.ink1,
    letterSpacing: -1.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.ink2,
    lineHeight: 26,
    textAlign: 'center',
  },
  footer: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  ctaBtn: {
    backgroundColor: Colors.coral,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: 15, fontFamily: 'NotoSansKR_700Bold', color: '#FFFFFF' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 13, color: Colors.ink3, fontFamily: 'NotoSansKR_500Medium' },
});
