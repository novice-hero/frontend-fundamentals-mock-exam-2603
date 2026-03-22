import { css } from '@emotion/react';
import { Border, Button, Spacing, Text, Top } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { Suspense, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDate } from 'shared/utils';
import MyReservationList from './MyReservationList';
import ReservationStatusList from './ReservationStatusList';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState(formatDate(new Date()));

  const locationState = location.state as { message?: string } | null;
  const initialMessage = locationState?.message ? { type: 'success' as const, text: locationState.message } : null;

  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  
  return (
    <div css={css`background: ${colors.white}; padding-bottom: 40px;`}>
      <Top.Top03 css={css`padding-left: 24px; padding-right: 24px;`}>
        회의실 예약
      </Top.Top03>

      <Spacing size={24} />

      {/* 날짜 선택 */}
      <div css={css`padding: 0 24px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <div css={css`display: flex; flex-direction: column; gap: 6px;`}>
          <input
            type="date"
            value={date}
            min={formatDate(new Date())}
            onChange={e => setDate(e.target.value)}
            aria-label="날짜"
            css={css`
              box-sizing: border-box; font-size: 16px; font-weight: 500; line-height: 1.5; height: 48px;
              background-color: ${colors.grey50}; border-radius: 12px; color: ${colors.grey800};
              width: 100%; border: 1px solid ${colors.grey200}; padding: 0 16px; outline: none;
              transition: border-color 0.15s; &:focus { border-color: ${colors.blue500}; }
            `}
          />
        </div>
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 현황 타임라인 */}
      <Suspense fallback={<ReservationStatusList.Loading />}>
        <ReservationStatusList date={date} />
      </Suspense>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 내 예약 목록 */}
      <Suspense fallback={<MyReservationList.Loading />}>
        <MyReservationList initialMessage={initialMessage} />
      </Suspense>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약하기 버튼 */}
      <div css={css`padding: 0 24px;`}>
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </div>
      <Spacing size={24} />
    </div>
  );
}
