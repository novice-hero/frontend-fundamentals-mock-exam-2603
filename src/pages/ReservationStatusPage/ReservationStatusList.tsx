import { css } from '@emotion/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Spacing, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import type { Reservation, Room } from '_tosslib/server/types';
import { getReservations, getRooms } from 'pages/remotes';
import { useRef, useState } from 'react';
import { EQUIPMENT_LABELS } from 'shared/consts';
import { useClickOutside } from 'shared/hooks/useClickOutside';
import { getHourLabels, getTimeSlots, timeToMinutes, TOTAL_MINUTES } from 'shared/time';

interface ReservationStatusListProps {
  date: string;
}

const ReservationStatusList = ({ date }: ReservationStatusListProps) => {
  const { data: rooms = [] } = useSuspenseQuery({ queryKey: ['rooms'], queryFn: getRooms });
  const { data: reservations = [] } = useSuspenseQuery({
    queryKey: ['reservations', date],
    queryFn: date ? () => getReservations(date) : () => Promise.resolve([]),
  });

  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  return (
    <div
      css={css`
        padding: 0 24px;
      `}
    >
      <Text typography="t5" fontWeight="bold" color={colors.grey900}>
        예약 현황
      </Text>
      <Spacing size={16} />

      <div
        css={css`
          background: ${colors.grey50};
          border-radius: 14px;
          padding: 16px;
        `}
      >
        {/* 시간 헤더 */}
        <div
          css={css`
            display: flex;
            align-items: flex-end;
            margin-bottom: 8px;
          `}
        >
          <div
            css={css`
              width: 80px;
              flex-shrink: 0;
              padding-right: 8px;
            `}
          />
          <div
            css={css`
              flex: 1;
              position: relative;
              height: 18px;
            `}
          >
            {getHourLabels(getTimeSlots()).map(t => {
              const left = (timeToMinutes(t) / TOTAL_MINUTES) * 100;
              return (
                <Text
                  key={t}
                  typography="t7"
                  fontWeight="regular"
                  color={colors.grey400}
                  css={css`
                    position: absolute;
                    left: ${left}%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    letter-spacing: -0.3px;
                  `}
                >
                  {t.slice(0, 2)}
                </Text>
              );
            })}
          </div>
        </div>

        {/* 회의실별 타임라인 */}
        {rooms.map((room, index) => {
          const roomReservations = reservations.filter(r => r.roomId === room.id);
          return (
            <div
              key={room.id}
              css={css`
                display: flex;
                align-items: center;
                height: 32px;
                ${index > 0 ? 'margin-top: 4px;' : ''}
              `}
            >
              <div
                css={css`
                  width: 80px;
                  flex-shrink: 0;
                  padding-right: 8px;
                `}
              >
                <Text
                  typography="t7"
                  fontWeight="medium"
                  color={colors.grey700}
                  ellipsisAfterLines={1}
                  css={css`
                    font-size: 12px;
                  `}
                >
                  {room.name}
                </Text>
              </div>
              <div
                css={css`
                  flex: 1;
                  height: 24px;
                  background: ${colors.white};
                  border-radius: 6px;
                  position: relative;
                  overflow: visible;
                `}
              >
                {roomReservations.map(res => {
                  const left = (timeToMinutes(res.start) / TOTAL_MINUTES) * 100;
                  const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
                  const isActive = activeReservation === res.id;
                  return (
                    <ReservationItem
                      key={res.id}
                      res={res}
                      room={room}
                      left={left}
                      width={width}
                      isActive={isActive}
                      onToggle={() => setActiveReservation(isActive ? null : res.id)}
                      onClose={() => setActiveReservation(null)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ReservationItemProps {
  res: Reservation;
  room: Room;
  left: number;
  width: number;
  isActive: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function ReservationItem({ res, room, left, width, isActive, onToggle, onClose }: ReservationItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, onClose);

  return (
    <div
      ref={containerRef}
      css={css`
        position: absolute;
        left: ${left}%;
        width: ${width}%;
        height: 100%;
      `}
    >
      <div
        role="button"
        aria-label={`${room.name} ${res.start}-${res.end} 예약 상세`}
        onClick={onToggle}
        css={css`
          width: 100%;
          height: 100%;
          background: ${colors.blue400};
          border-radius: 4px;
          opacity: ${isActive ? 1 : 0.75};
          cursor: pointer;
          transition: opacity 0.15s;
          &:hover {
            opacity: 1;
          }
        `}
      />
      {isActive && (
        <div
          role="tooltip"
          css={css`
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 6px;
            background: ${colors.grey900};
            color: ${colors.white};
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 10;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            line-height: 1.6;
          `}
        >
          <div>
            {res.start} ~ {res.end}
          </div>
          <div>{res.attendees}명</div>
          {res.equipment.length > 0 && <div>{res.equipment.map(e => EQUIPMENT_LABELS[e]).join(', ')}</div>}
        </div>
      )}
    </div>
  );
}

const Loading = () => {
  return (
    <Text typography="t5" fontWeight="bold" color={colors.grey900}>
      예약 현황을 불러오는 중입니다...
    </Text>
  );
};

ReservationStatusList.Loading = Loading;

export default ReservationStatusList;
