import { phaseForDay, daysUntilPeriod, CYCLE_DEFAULTS } from '../utils/phase';

describe('phaseForDay', () => {
  describe('기본값 (cycle=28, period=5)', () => {
    // follicularEnd = min(5+7, 28-2) = 12, ovulationEnd = min(12+4, 28-1) = 16
    it.each([1, 3, 5])('day %i → menstrual', (day) => {
      expect(phaseForDay(day)).toBe('menstrual');
    });
    it.each([6, 9, 12])('day %i → follicular', (day) => {
      expect(phaseForDay(day)).toBe('follicular');
    });
    it.each([13, 15, 16])('day %i → ovulation', (day) => {
      expect(phaseForDay(day)).toBe('ovulation');
    });
    it.each([17, 22, 28])('day %i → luteal', (day) => {
      expect(phaseForDay(day)).toBe('luteal');
    });
  });

  describe('생리 기간 커스텀 (period=3, cycle=28)', () => {
    // follicularEnd = min(3+7, 26) = 10, ovulationEnd = min(14, 27) = 14
    it.each([1, 2, 3])('day %i → menstrual', (day) => {
      expect(phaseForDay(day, 28, 3)).toBe('menstrual');
    });
    it.each([4, 7, 10])('day %i → follicular', (day) => {
      expect(phaseForDay(day, 28, 3)).toBe('follicular');
    });
    it.each([11, 12, 14])('day %i → ovulation', (day) => {
      expect(phaseForDay(day, 28, 3)).toBe('ovulation');
    });
    it.each([15, 21, 28])('day %i → luteal', (day) => {
      expect(phaseForDay(day, 28, 3)).toBe('luteal');
    });
  });

  describe('긴 생리 기간 (period=7, cycle=28)', () => {
    // follicularEnd = min(14, 26) = 14, ovulationEnd = min(18, 27) = 18
    it.each([1, 4, 7])('day %i → menstrual', (day) => {
      expect(phaseForDay(day, 28, 7)).toBe('menstrual');
    });
    it.each([8, 11, 14])('day %i → follicular', (day) => {
      expect(phaseForDay(day, 28, 7)).toBe('follicular');
    });
    it.each([15, 17, 18])('day %i → ovulation', (day) => {
      expect(phaseForDay(day, 28, 7)).toBe('ovulation');
    });
    it.each([19, 24, 28])('day %i → luteal', (day) => {
      expect(phaseForDay(day, 28, 7)).toBe('luteal');
    });
  });

  describe('짧은 주기 (cycle=21, period=5)', () => {
    // follicularEnd = min(12, 19) = 12, ovulationEnd = min(16, 20) = 16
    it.each([1, 3, 5])('day %i → menstrual', (day) => {
      expect(phaseForDay(day, 21, 5)).toBe('menstrual');
    });
    it.each([6, 9, 12])('day %i → follicular', (day) => {
      expect(phaseForDay(day, 21, 5)).toBe('follicular');
    });
    it.each([13, 15, 16])('day %i → ovulation', (day) => {
      expect(phaseForDay(day, 21, 5)).toBe('ovulation');
    });
    it.each([17, 19, 21])('day %i → luteal', (day) => {
      expect(phaseForDay(day, 21, 5)).toBe('luteal');
    });
  });

  describe('극단 주기 guard (period=10, cycle=17) — 이전 blocker 케이스', () => {
    // follicularEnd = min(17, 15) = 15, ovulationEnd = min(19, 16) = 16
    it.each([1, 5, 10])('day %i → menstrual', (day) => {
      expect(phaseForDay(day, 17, 10)).toBe('menstrual');
    });
    it.each([11, 13, 15])('day %i → follicular', (day) => {
      expect(phaseForDay(day, 17, 10)).toBe('follicular');
    });
    it('day 16 → ovulation', () => {
      expect(phaseForDay(16, 17, 10)).toBe('ovulation');
    });
    it('day 17 → luteal (황체기 최소 1일 보장)', () => {
      expect(phaseForDay(17, 17, 10)).toBe('luteal');
    });
  });

  describe('경계값 처리', () => {
    it('day < 1 → day 1로 클램핑', () => {
      expect(phaseForDay(0)).toBe('menstrual');
      expect(phaseForDay(-5)).toBe('menstrual');
    });

    it('day > cycleLength → 주기 내 wrap', () => {
      // day 29, cycle 28 → (29-1)%28+1 = 1 → menstrual
      expect(phaseForDay(29, 28, 5)).toBe('menstrual');
      // day 33, cycle 28 → (33-1)%28+1 = 5 → menstrual
      expect(phaseForDay(33, 28, 5)).toBe('menstrual');
      // day 45, cycle 28 → (45-1)%28+1 = 17 → luteal
      expect(phaseForDay(45, 28, 5)).toBe('luteal');
    });

    it('모든 단계가 반환 가능 (4단계 전부 도달 가능)', () => {
      const results = new Set(
        Array.from({ length: 28 }, (_, i) => phaseForDay(i + 1, 28, 5)),
      );
      expect(results).toEqual(new Set(['menstrual', 'follicular', 'ovulation', 'luteal']));
    });

    it('극단 주기에서도 4단계 전부 도달 가능', () => {
      const results = new Set(
        Array.from({ length: 17 }, (_, i) => phaseForDay(i + 1, 17, 10)),
      );
      expect(results).toEqual(new Set(['menstrual', 'follicular', 'ovulation', 'luteal']));
    });
  });
});

describe('daysUntilPeriod', () => {
  it('주기 첫 날 → cycleLength 반환', () => {
    expect(daysUntilPeriod(1, 28)).toBe(28);
  });
  it('주기 마지막 날 → 1 반환', () => {
    expect(daysUntilPeriod(28, 28)).toBe(1);
  });
  it('주기 초과 → 0 반환', () => {
    expect(daysUntilPeriod(29, 28)).toBe(0);
    expect(daysUntilPeriod(35, 28)).toBe(0);
  });
  it('기본 cycleLength 사용', () => {
    expect(daysUntilPeriod(1)).toBe(CYCLE_DEFAULTS.length);
  });
});
