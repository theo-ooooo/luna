import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';

const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'kakao.com', 'daum.net', 'hanmail.net', 'nate.com', 'icloud.com'];

interface DomainChipsProps {
  query: string;
  matches: string[];
  onPick: (domain: string) => void;
}

export function DomainChips({ query, matches, onPick }: DomainChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row} contentContainerStyle={styles.content}>
      {matches.map((d, i) => {
        const idx = query.length > 0 ? d.toLowerCase().indexOf(query) : -1;
        return (
          <TouchableOpacity key={d} style={[styles.chip, i === 0 && styles.chipTop]} onPress={() => onPick(d)}>
            <Text style={[styles.at, i === 0 && styles.atTop]}>@</Text>
            <Text style={[styles.domain, i === 0 && styles.domainTop]}>
              {idx >= 0 ? (
                d.slice(0, idx) + d.slice(idx, idx + query.length) + d.slice(idx + query.length)
              ) : d}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function getEmailMatches(email: string): { show: boolean; local: string; query: string; matches: string[] } {
  const atIdx = email.indexOf('@');
  if (atIdx < 0 || email.slice(0, atIdx).length === 0) return { show: false, local: email, query: '', matches: [] };
  const local = email.slice(0, atIdx);
  const query = email.slice(atIdx + 1).toLowerCase();
  const matches = EMAIL_DOMAINS.filter(d => d.toLowerCase().includes(query));
  return { show: matches.length > 0, local, query, matches };
}

const styles = StyleSheet.create({
  row: { marginTop: 10 },
  content: { gap: 6, paddingBottom: 2 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.pill,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  chipTop: { backgroundColor: Colors.bgInk },
  at: { fontSize: 12, fontWeight: '600', color: Colors.ink3, marginRight: 1 },
  atTop: { color: 'rgba(242,238,232,0.5)' },
  domain: { fontSize: 12, fontWeight: '700', color: Colors.ink1 },
  domainTop: { color: Colors.inkInv },
});
