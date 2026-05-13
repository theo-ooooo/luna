export const Colors = {
  // Surface
  bg: '#F2EEE8',
  bgAlt: '#E9E3D9',
  bgCard: '#FFFFFF',
  bgInk: '#14110F',
  bgInkAlt: '#1F1A16',

  // Ink
  ink1: '#14110F',
  ink2: '#5C544D',
  ink3: '#948A80',
  ink4: '#C9BFB3',
  inkInv: '#F2EEE8',

  // Accents
  coral: '#FF5A47',
  coralDeep: '#E0392A',
  coralSoft: '#FFB8AE',
  lime: '#D4FF4D',
  limeDeep: '#B5E021',
  lavender: '#C9B8FF',
  lavenderDeep: '#7A5FE0',
  plum: '#2A1B3D',
  butter: '#FFE15C',
  sage: '#9BC49C',

  // Borders
  border: '#1F1A16',
  borderSoft: '#DCD3C5',
  borderStrong: '#14110F',
} as const;

export const Phase = {
  menstrual:  { color: '#FF5A47', soft: '#FFB8AE', bg: '#FFDFD9', ink: '#FFFFFF', ko: '월경기', en: 'MENSTRUAL',  desc: '몸이 회복 중이에요. 무리하지 말고 천천히.' },
  follicular: { color: '#B5E021', soft: '#ECFFB0', bg: '#F1FFC9', ink: '#14110F', ko: '난포기', en: 'FOLLICULAR', desc: '에너지가 차오르는 시기. 새로운 일을 시작해 보세요.' },
  ovulation:  { color: '#FFD53D', soft: '#FFF1A8', bg: '#FFF6C9', ink: '#14110F', ko: '배란기', en: 'OVULATION',  desc: '몸과 마음이 가장 활기찬 때. 임신 가능성이 가장 높아요.' },
  luteal:     { color: '#C9B8FF', soft: '#E2D7FF', bg: '#ECE3FF', ink: '#14110F', ko: '황체기', en: 'LUTEAL',     desc: 'PMS가 찾아올 수 있어요. 자신에게 다정해지세요.' },
} as const;

export type PhaseKey = keyof typeof Phase;

// NotoSansKR 폰트 패밀리 이름 (fontWeight 숫자 → fontFamily 변환)
// Android는 fontWeight 숫자 문자열을 올바르게 처리하지 못하므로
// 각 굵기별 폰트 파일을 fontFamily로 직접 지정한다.
// 100/200/300 굵기는 앱에서 사용되지 않아 로드하지 않으므로 제외한다.
export const FontFamily = {
  '400': 'NotoSansKR_400Regular',
  '500': 'NotoSansKR_500Medium',
  '600': 'NotoSansKR_600SemiBold',
  '700': 'NotoSansKR_700Bold',
  '800': 'NotoSansKR_800ExtraBold',
  '900': 'NotoSansKR_900Black',
} as const;

export const Typography = {
  family: 'NotoSansKR',
  massive: 132,
  hero: 96,
  display: 64,
  h1: 36,
  h2: 24,
  h3: 18,
  body: 15,
  meta: 12,
  label: 10,
} as const;

export const Radius = {
  card: 24,
  cardLg: 32,
  pill: 999,
  tile: 20,
  chip: 14,
} as const;

import { StyleSheet } from 'react-native';

export const Shadow = StyleSheet.create({
  lift: {
    shadowColor: Colors.ink1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
    elevation: 4,
  },
  soft: {
    shadowColor: Colors.ink1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 3,
  },
  card: {
    shadowColor: Colors.ink1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
});

export const Motion = {
  fast: 180,
  base: 320,
  slow: 600,
} as const;
