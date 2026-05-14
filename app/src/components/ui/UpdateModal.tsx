import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';
import { LunaLogo } from './LunaLogo';

interface Props {
  type: 'optional' | 'force';
  storeUrl: string | null;
  onDismiss?: () => void;
}

export function UpdateModal({ type, storeUrl, onDismiss }: Props) {
  const isForce = type === 'force';
  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  function handleUpdate() {
    if (storeUrl) Linking.openURL(storeUrl);
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LunaLogo size={20} />
          <Text style={styles.title}>
            {isForce ? '업데이트가 필요해요' : '새 버전이 나왔어요'}
          </Text>
          <Text style={styles.body}>
            {isForce
              ? '이 버전은 더 이상 지원하지 않아요.\n계속 사용하려면 업데이트해 주세요.'
              : '더 나은 Luna를 경험하세요.\n새로운 기능과 버그 수정이 포함돼 있어요.'}
          </Text>
          <TouchableOpacity
            style={[styles.updateBtn, !storeUrl && styles.updateBtnDisabled]}
            onPress={handleUpdate}
            activeOpacity={0.8}
            disabled={!storeUrl}
          >
            <Text style={styles.updateBtnText}>{storeName}에서 업데이트</Text>
          </TouchableOpacity>
          {!isForce && onDismiss && (
            <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.7}>
              <Text style={styles.dismissBtnText}>다음에 할게요</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,17,15,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.cardLg,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_800ExtraBold',
    color: Colors.ink1,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    fontSize: 14,
    color: Colors.ink2,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 4,
  },
  updateBtn: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.coral,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnDisabled: {
    opacity: 0.4,
  },
  updateBtnText: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
  },
  dismissBtn: {
    paddingVertical: 8,
  },
  dismissBtnText: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_600SemiBold',
    color: Colors.ink3,
  },
});
