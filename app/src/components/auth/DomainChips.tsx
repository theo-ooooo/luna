import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme/tokens';

const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'kakao.com', 'daum.net', 'hanmail.net', 'nate.com', 'icloud.com'];

interface DomainChipsProps {
  local: string;
  query: string;
  matches: string[];
  onPick: (domain: string) => void;
}

export function DomainChips({ local, query, matches, onPick }: DomainChipsProps) {
  return (
    <View style={styles.dropdown}>
      {matches.map((d, i) => {
        const qIdx = query.length > 0 ? d.toLowerCase().indexOf(query.toLowerCase()) : -1;
        return (
          <TouchableOpacity
            key={d}
            style={[styles.option, i > 0 && styles.optionDivider]}
            onPress={() => onPick(d)}
            activeOpacity={0.6}
          >
            <Text style={styles.local} numberOfLines={1}>{local}</Text>
            <Text style={styles.at}>@</Text>
            {qIdx >= 0 ? (
              <Text style={styles.domain} numberOfLines={1}>
                {d.slice(0, qIdx)}
                <Text style={styles.domainMatch}>{d.slice(qIdx, qIdx + query.length)}</Text>
                {d.slice(qIdx + query.length)}
              </Text>
            ) : (
              <Text style={styles.domain} numberOfLines={1}>{d}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
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
  dropdown: {
    marginTop: 4,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.tile,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
  },
  local: { fontSize: 13, fontWeight: '700', color: Colors.ink1, flexShrink: 1 },
  at: { fontSize: 13, fontWeight: '400', color: Colors.ink3, marginHorizontal: 1 },
  domain: { fontSize: 13, fontWeight: '400', color: Colors.ink2, flexShrink: 1 },
  domainMatch: { fontWeight: '700', color: Colors.ink1 },
});
