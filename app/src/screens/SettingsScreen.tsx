import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import { useUpdateProfile } from '../hooks/useProfile';

export function SettingsScreen() {
  const user = useAuthStore(s => s.user);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const update = useUpdateProfile();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [cycleLen, setCycleLen] = useState(user?.cycle_length_default ?? 28);
  const [lutealLen, setLutealLen] = useState(user?.luteal_phase_length ?? 14);
  const [notiEnabled, setNotiEnabled] = useState(user?.notifications_enabled ?? false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname ?? '');
      setCycleLen(user.cycle_length_default);
      setLutealLen(user.luteal_phase_length);
      setNotiEnabled(user.notifications_enabled ?? false);
    }
  }, [user]);

  function handleSave() {
    update.mutate(
      { nickname: nickname.trim() || undefined, cycle_length_default: cycleLen, luteal_phase_length: lutealLen, notifications_enabled: notiEnabled },
      {
        onSuccess: () => Toast.show({ type: 'success', text1: '설정 저장 완료!' }),
        onError: (err) => Toast.show({ type: 'error', text1: '저장 실패', text2: (err as Error).message ?? '다시 시도해주세요.' }),
      },
    );
  }

  function handleLogout() {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: clearAuth },
    ]);
  }

  const initial = (user?.nickname || user?.email || 'L')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft} />
        <Text style={styles.topBarLabel}>04 · 설정</Text>
        <TouchableOpacity
          style={[styles.saveBtn, update.isPending && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={update.isPending}
        >
          <Text style={styles.saveBtnText}>{update.isPending ? '저장 중…' : '저장'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 */}
        <View style={[styles.profileCard, Shadow.card]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileSince}>Luna 사용 중</Text>
          </View>
        </View>

        {/* 프로필 설정 */}
        <Section title="프로필">
          <SettingRow label="호칭">
            <TextInput
              style={styles.textInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임"
              placeholderTextColor={Colors.ink4}
              maxLength={20}
            />
          </SettingRow>
        </Section>

        {/* 주기 설정 */}
        <Section title="주기 설정">
          <SettingRow label="평균 주기 길이" detail={`${cycleLen}일`}>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setCycleLen(v => Math.max(21, v - 1))}>
                <Icon name="minus" size={16} strokeWidth={2.4} color={Colors.ink1} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{cycleLen}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setCycleLen(v => Math.min(45, v + 1))}>
                <Icon name="plus" size={16} strokeWidth={2.4} color={Colors.ink1} />
              </TouchableOpacity>
            </View>
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="황체기 길이" detail={`${lutealLen}일`}>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setLutealLen(v => Math.max(10, v - 1))}>
                <Icon name="minus" size={16} strokeWidth={2.4} color={Colors.ink1} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{lutealLen}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setLutealLen(v => Math.min(16, v + 1))}>
                <Icon name="plus" size={16} strokeWidth={2.4} color={Colors.ink1} />
              </TouchableOpacity>
            </View>
          </SettingRow>
        </Section>

        {/* 알림 */}
        <Section title="알림">
          <SettingRow label="생리 예정일 알림">
            <Switch
              value={notiEnabled}
              onValueChange={setNotiEnabled}
              trackColor={{ false: Colors.borderSoft, true: Colors.coral }}
              thumbColor={Colors.inkInv}
            />
          </SettingRow>
        </Section>

        {/* 계정 */}
        <Section title="계정">
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
            <Icon name="chev" size={16} strokeWidth={2} color={Colors.coral} />
          </TouchableOpacity>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={[styles.section, Shadow.card]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SettingRow({ label, detail, children }: { label: string; detail?: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Text style={styles.settingLabelText}>{label}</Text>
        {detail && <Text style={styles.settingDetail}>{detail}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  topBarLeft: { width: 52 },
  topBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink3, letterSpacing: -0.1 },
  saveBtn: { backgroundColor: Colors.bgInk, borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: Colors.inkInv },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.bgCard, borderRadius: Radius.tile, padding: 18 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.bgInk, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900', color: Colors.coral },
  profileInfo: { flex: 1 },
  profileEmail: { fontSize: 13, fontWeight: '700', color: Colors.ink1 },
  profileSince: { fontSize: 11, color: Colors.ink3, marginTop: 2 },
  section: { backgroundColor: Colors.bgCard, borderRadius: Radius.tile, padding: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.ink3, marginBottom: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  settingLabel: { flex: 1 },
  settingLabelText: { fontSize: 14, fontWeight: '600', color: Colors.ink1 },
  settingDetail: { fontSize: 11, color: Colors.ink3, marginTop: 2 },
  textInput: { fontSize: 14, fontWeight: '600', color: Colors.ink1, textAlign: 'right', minWidth: 100 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 16, fontWeight: '800', color: Colors.ink1, minWidth: 28, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.borderSoft, marginVertical: 8 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  logoutText: { fontSize: 14, fontWeight: '600', color: Colors.coral },
});
