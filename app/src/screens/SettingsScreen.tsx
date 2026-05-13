import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Colors, Radius, Shadow } from '../theme/tokens';
import { Icon } from '../components/ui/Icon';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useUpdateProfile } from '../hooks/useProfile';
import { useNotificationStore } from '../store/notificationStore';

export function SettingsScreen() {
  const user = useAuthStore(s => s.user);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const update = useUpdateProfile();
  const qc = useQueryClient();

  const { prefs, setPrefs, permissionGranted, permissionChecked } = useNotificationStore();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [cycleLen, setCycleLen] = useState(user?.cycle_length_default ?? 28);
  const [lutealLen, setLutealLen] = useState(user?.luteal_phase_length ?? 14);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname ?? '');
      setCycleLen(user.cycle_length_default);
      setLutealLen(user.luteal_phase_length);
    }
  }, [user]);

  function handleSave() {
    update.mutate(
      { nickname: nickname.trim() || undefined, cycle_length_default: cycleLen, luteal_phase_length: lutealLen },
      {
        onSuccess: () => Toast.show({ type: 'success', text1: '설정 저장 완료!' }),
        onError: (err) => Toast.show({ type: 'error', text1: '저장 실패', text2: (err as Error).message ?? '다시 시도해주세요.' }),
      },
    );
  }

  function handleLogout() {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => { qc.clear(); clearAuth(); } },
    ]);
  }

  const tabBarHeight = useBottomTabBarHeight();
  const initial = (user?.nickname || user?.email || 'L')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarLabel}>설정</Text>
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
          {permissionChecked && !permissionGranted && (
            <View style={styles.notiWarning}>
              <Text style={styles.notiWarningText}>알림 권한이 허용되지 않았습니다. 기기 설정에서 Luna 알림을 켜주세요.</Text>
            </View>
          )}
          <NotiRow
            label="생리 예정일 알림"
            sub="예정일 3일·1일 전 오전 9시"
            value={prefs.periodReminder}
            onChange={(v) => setPrefs({ periodReminder: v })}
          />
          <View style={styles.divider} />
          <NotiRow
            label="배란 예정일 알림"
            sub="예정 배란일 2일·당일 오전 9시"
            value={prefs.ovulationAlert}
            onChange={(v) => setPrefs({ ovulationAlert: v })}
          />
          <View style={styles.divider} />
          <NotiRow
            label="가임기 시작 알림"
            sub="가임기 첫날 오전 9시"
            value={prefs.fertileStart}
            onChange={(v) => setPrefs({ fertileStart: v })}
          />
          <View style={styles.divider} />
          <NotiRow
            label="기록 독려"
            sub="예정일 당일 미기록 시 오후 8시"
            value={prefs.logNudge}
            onChange={(v) => setPrefs({ logNudge: v })}
          />
          <View style={styles.divider} />
          <NotiRow
            label="일일 리마인더"
            sub="매일 오후 10시 (기본 꺼짐)"
            value={prefs.dailyReminder}
            onChange={(v) => setPrefs({ dailyReminder: v })}
          />
          <View style={styles.divider} />
          <NotiRow
            label="월간 리포트"
            sub="주기 종료 다음날 오전 10시"
            value={prefs.monthlyReport}
            onChange={(v) => setPrefs({ monthlyReport: v })}
          />
        </Section>

        {/* 계정 */}
        <Section title="계정">
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
            <Icon name="chev" size={16} strokeWidth={2} color={Colors.coral} />
          </TouchableOpacity>
        </Section>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: tabBarHeight + 8 }]}>
        <TouchableOpacity
          style={[styles.saveBtn, update.isPending && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={update.isPending}
        >
          <Icon name="check" size={16} strokeWidth={2.4} color={Colors.inkInv} />
          <Text style={styles.saveBtnText}>{update.isPending ? '저장 중…' : '저장'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function NotiRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Text style={styles.settingLabelText}>{label}</Text>
        <Text style={styles.settingDetail}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.borderSoft, true: Colors.coral }}
        thumbColor={Colors.inkInv}
      />
    </View>
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
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  topBarLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink3, letterSpacing: -0.1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  bottomBar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderSoft, backgroundColor: Colors.bg },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.coral, borderRadius: Radius.pill, paddingVertical: 16 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: Colors.inkInv, letterSpacing: -0.2 },
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
  notiWarning: { backgroundColor: Colors.bgAlt, borderRadius: 10, padding: 12, marginBottom: 14 },
  notiWarningText: { fontSize: 12, color: Colors.ink2, lineHeight: 18 },
});
