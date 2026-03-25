// 궁금한 점: 시간 관련된 상수 및 함수라 time이라는 파일 네이밍을 했는데 timeUtils? 아니면 utils에 몰아넣기?

export const TIMELINE_START = 9;
export const TIMELINE_END = 20;
export const TOTAL_MINUTES = (TIMELINE_END - TIMELINE_START) * 60;

export function getTimeSlots(): string[] {
  const slots = [];
  for (let h = TIMELINE_START; h <= TIMELINE_END; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < TIMELINE_END) {
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
  }
  return slots;
}

export function getHourLabels(timeSlots: string[]): string[] {
  return timeSlots.filter(t => t.endsWith(':00'));
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - TIMELINE_START) * 60 + m;
}
