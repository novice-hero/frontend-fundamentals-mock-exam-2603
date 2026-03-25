import { css } from '@emotion/react';
import { Border, Button, Spacing, Text, Top } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { Suspense, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDate } from 'shared/utils';
import { DatePicker } from 'shared/components/DatePicker';
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
    <div
      css={css`
        background: ${colors.white};
        padding-bottom: 40px;
      `}
    >
      <Top.Top03
        css={css`
          padding-left: 24px;
          padding-right: 24px;
        `}
      >
        회의실 예약
      </Top.Top03>

      <Spacing size={24} />

      <div
        css={css`
          padding: 0 24px;
        `}
      >
        <Text as="label" htmlFor="date-picker" typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <DatePicker id="date-picker" value={date} onChange={setDate} min={formatDate(new Date())} />
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <Suspense fallback={<ReservationStatusList.Loading />}>
        <ReservationStatusList date={date} />
      </Suspense>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <Suspense fallback={<MyReservationList.Loading />}>
        <MyReservationList initialMessage={initialMessage} />
      </Suspense>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <div
        css={css`
          padding: 0 24px;
        `}
      >
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </div>
      <Spacing size={24} />
    </div>
  );
}
