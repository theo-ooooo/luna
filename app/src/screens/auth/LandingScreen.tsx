import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../../theme/tokens';
import { LunaLogo } from '../../components/ui/LunaLogo';
import { AppleSignInButton } from './AppleSignInButton';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.top}>
          <LunaLogo size={22} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>LUNA · 루나</Text>
          <Text style={styles.title}>나의 리듬을{'\n'}기록해요<Text style={styles.coral}>.</Text></Text>
          <Text style={styles.body}>생리주기, 증상, 기분을 한 곳에서{'\n'}스마트하게 관리해보세요.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.emailButton} onPress={() => navigation.navigate('Email')} activeOpacity={0.8}>
            <Text style={styles.emailButtonText}>이메일로 로그인</Text>
          </TouchableOpacity>

          <AppleSignInButton />

          <Text style={styles.terms}>
            계속하면 Luna의 이용약관 및{'\n'}개인정보처리방침에 동의하게 됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  top: { marginBottom: 48 },
  hero: { flex: 1, justifyContent: 'center' },
  eyebrow: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.ink3,
    letterSpacing: 1.6,
    marginBottom: 12,
  },
  title: {
    fontSize: 48,
    fontFamily: 'NotoSansKR_900Black',
    letterSpacing: -2.4,
    lineHeight: 56,
    color: Colors.ink1,
    marginBottom: 16,
  },
  coral: { color: Colors.coral },
  body: {
    fontSize: 14,
    color: Colors.ink2,
    lineHeight: 22,
  },
  actions: { gap: 0 },
  emailButton: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.coral,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'NotoSansKR_600SemiBold',
  },
  terms: {
    marginTop: 20,
    fontSize: 11,
    color: Colors.ink3,
    textAlign: 'center',
    lineHeight: 17,
  },
});
