import { css } from '@emotion/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ListRow, Spacing, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { cancelReservation, getMyReservations, getRooms } from 'pages/remotes';
import { useState } from 'react';
import { EQUIPMENT_LABELS } from 'shared/consts';

interface MyReservationListProps {
  initialMessage?: { type: 'success' | 'error'; text: string } | null;
}

const MyReservationList = ({ initialMessage }: MyReservationListProps) => {
  const queryClient = useQueryClient();
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: getRooms });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(initialMessage ?? null);

  const { data: myReservationList = [] } = useQuery({ queryKey: ['myReservations'], queryFn: getMyReservations });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
  });

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      setMessage({ type: 'success', text: '예약이 취소되었습니다.' });
    } catch {
      setMessage({ type: 'error', text: '취소에 실패했습니다.' });
    }
  };

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? roomId;

  return (
    <>
      {/* 메시지 배너 */}
      {message && (
        <div css={css`padding: 0 24px;`}>
          <div
            css={css`
              padding: 10px 14px; border-radius: 10px;
              background: ${message.type === 'success' ? colors.blue50 : colors.red50};
              display: flex; align-items: center; gap: 8px;
            `}
          >
            <Text
              typography="t7"
              fontWeight="medium"
              color={message.type === 'success' ? colors.blue600 : colors.red500}
            >
              {message.text}
            </Text>
          </div>
          <Spacing size={12} />
        </div>
      )}

      {/* 내 예약 목록 */}
      <div css={css`padding: 0 24px;`}>
        <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
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
          <div css={css`padding: 40px 0; text-align: center; background: ${colors.grey50}; border-radius: 14px;`}>
            <Text typography="t6" color={colors.grey500}>
              예약 내역이 없습니다.
            </Text>
          </div>
        ) : (
          <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
            {myReservationList.map((res: { id: string; roomId: string; date: string; start: string; end: string; attendees: number; equipment: string[] }) => (
              <div
                key={res.id}
                css={css`padding: 14px 16px; border-radius: 14px; background: ${colors.grey50}; border: 1px solid ${colors.grey200};`}
              >
                <ListRow
                  contents={
                    <ListRow.Text2Rows
                      top={getRoomName(res.roomId)}
                      topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                      bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'}`}
                      bottomProps={{ typography: 't7', color: colors.grey600 }}
                    />
                  }
                  right={
                    <Button
                      type="danger"
                      style="weak"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('정말 취소하시겠습니까?')) {
                          handleCancel(res.id);
                        }
                      }}
                    >
                      취소
                    </Button>
                  }
                />
              </div>
            ))}
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
