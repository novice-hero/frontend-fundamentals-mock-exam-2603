import { css } from '@emotion/react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Button, ListRow, Spacing, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { cancelReservation, getMyReservations, getRooms } from 'pages/remotes';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageBanner } from 'shared/components/MessageBanner';
import { EQUIPMENT_LABELS } from 'shared/consts';

const MyReservationList = () => {
  const location = useLocation();
  const locationState = location.state as { message?: string } | null;
  const initialMessage = locationState?.message ? { type: 'success' as const, text: locationState.message } : null;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(initialMessage ?? null);
  // 일단 사용처와 소비처를 최대한 가깝게 붙였는데, 이러면 이 컴포넌트에 책임이 너무 많아지긴 함
  // 전역 토스트 컴포넌트 혹은 Context Api를 활용한 추상화 밖에 생각이 나질 않음
  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const queryClient = useQueryClient();
  const { data: rooms = [] } = useSuspenseQuery({ queryKey: ['rooms'], queryFn: getRooms });
  const { data: myReservationList = [] } = useSuspenseQuery({
    queryKey: ['myReservations'],
    queryFn: getMyReservations,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
  });

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? roomId;

  return (
    <>
      {/* 메시지 배너 */}
      {message && (
        <div
          css={css`
            padding: 0 24px;
          `}
        >
          <MessageBanner
            text={message.text}
            textColor={message.type === 'success' ? colors.blue600 : colors.red500}
            backgroundColor={message.type === 'success' ? colors.blue50 : colors.red50}
          />
        </div>
      )}
      <Spacing size={12} />

      {/* 내 예약 목록 */}
      <div
        css={css`
          padding: 0 24px;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: baseline;
            gap: 6px;
          `}
        >
          <Text typography="t5" fontWeight="bold" color={colors.grey900}>
            내 예약
          </Text>
          {myReservationList.length > 0 && (
            <Text typography="t7" fontWeight="medium" color={colors.grey500}>
              {myReservationList.length}건
            </Text>
          )}
        </div>
        <Spacing size={16} />

        {myReservationList.length === 0 ? (
          <div
            css={css`
              padding: 40px 0;
              text-align: center;
              background: ${colors.grey50};
              border-radius: 14px;
            `}
          >
            <Text typography="t6" color={colors.grey500}>
              예약 내역이 없습니다.
            </Text>
          </div>
        ) : (
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 10px;
            `}
          >
            {myReservationList.map(
              (res: {
                id: string;
                roomId: string;
                date: string;
                start: string;
                end: string;
                attendees: number;
                equipment: string[];
              }) => (
                <div
                  key={res.id}
                  css={css`
                    padding: 14px 16px;
                    border-radius: 14px;
                    background: ${colors.grey50};
                    border: 1px solid ${colors.grey200};
                  `}
                >
                  <ListRow
                    contents={
                      <ListRow.Text2Rows
                        top={getRoomName(res.roomId)}
                        topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                        bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${
                          res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'
                        }`}
                        bottomProps={{ typography: 't7', color: colors.grey600 }}
                      />
                    }
                    right={
                      <Button
                        type="danger"
                        style="weak"
                        size="small"
                        disabled={cancelMutation.isPending}
                        onClick={async e => {
                          e.stopPropagation();
                          if (window.confirm('정말 취소하시겠습니까?')) {
                            try {
                              await cancelMutation.mutateAsync(res.id);
                              setMessage({ type: 'success', text: '예약이 취소되었습니다.' });
                            } catch {
                              setMessage({ type: 'error', text: '취소에 실패했습니다.' });
                            }
                          }
                        }}
                      >
                        취소
                      </Button>
                    }
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
};

const Loading = () => {
  return (
    <Text typography="t5" fontWeight="bold" color={colors.grey900}>
      내 예약 목록을 불러오는 중입니다...
    </Text>
  );
};

MyReservationList.Loading = Loading;

export default MyReservationList;
