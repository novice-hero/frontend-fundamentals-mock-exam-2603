import { css } from '@emotion/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Border, Button, ListRow, Select, Spacing, Text, Top } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import axios from 'axios';
import { createReservation, getReservations, getRooms } from 'pages/remotes';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DatePicker } from 'shared/components/DatePicker';
import { EQUIPMENT_LABELS } from 'shared/consts';
import { getTimeSlots } from 'shared/time';
import { formatDate } from 'shared/utils';
import { filterRooms } from './filterRooms';
import type { Equipment } from '_tosslib/server/types';

const ALL_EQUIPMENT: Equipment[] = Object.keys(EQUIPMENT_LABELS).filter((key): key is Equipment => key in EQUIPMENT_LABELS);

export function RoomBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const date = searchParams.get('date') || formatDate(new Date());
  const startTime = searchParams.get('startTime') || '';
  const endTime = searchParams.get('endTime') || '';
  const attendees = Number(searchParams.get('attendees')) || 1;
  const equipment: Equipment[] =
    searchParams
      .get('equipment')
      ?.split(',')
      .filter((e): e is Equipment => e in EQUIPMENT_LABELS) ?? [];
  const preferredFloor = searchParams.get('floor') ? Number(searchParams.get('floor')) : null;

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setFilter = (key: string, value: string | null) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true }
    );
    setSelectedRoomId(null);
    setErrorMessage(null);
  };

  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: getRooms });
  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations', date],
    queryFn: () => getReservations(date),
    enabled: !!date,
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      roomId: string;
      date: string;
      start: string;
      end: string;
      attendees: number;
      equipment: Equipment[];
    }) => createReservation(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
  });

  let validationError: string | null = null;
  const hasTimeInputs = startTime !== '' && endTime !== '';
  if (hasTimeInputs) {
    if (endTime <= startTime) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (attendees < 1) {
      validationError = '참석 인원은 1명 이상이어야 합니다.';
    }
  }
  const isFilterComplete = hasTimeInputs && !validationError;

  const floors = [...new Set(rooms.map((r: { floor: number }) => r.floor))].sort((a: number, b: number) => a - b);

  const availableRooms = isFilterComplete
    ? filterRooms(rooms, { attendees, equipment, preferredFloor, date, startTime, endTime, reservations })
    : [];

  const handleBook = async () => {
    if (!selectedRoomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('시작 시간과 종료 시간을 선택해주세요.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        roomId: selectedRoomId,
        date,
        start: startTime,
        end: endTime,
        attendees,
        equipment,
      });

      if ('ok' in result && result.ok) {
        navigate('/', { state: { message: '예약이 완료되었습니다!' } });
        return;
      }

      const errResult = result as { message?: string };
      setErrorMessage(errResult.message ?? '예약에 실패했습니다.');
      setSelectedRoomId(null);
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      setErrorMessage(serverMessage);
      setSelectedRoomId(null);
    }
  };

  return (
    <div
      css={css`
        background: ${colors.white};
        padding-bottom: 40px;
      `}
    >
      <div
        css={css`
          padding: 12px 24px 0;
        `}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="뒤로가기"
          css={css`
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            font-size: 14px;
            color: ${colors.grey600};
            &:hover {
              color: ${colors.grey900};
            }
          `}
        >
          ← 예약 현황으로
        </button>
      </div>
      <Top.Top03
        css={css`
          padding-left: 24px;
          padding-right: 24px;
        `}
      >
        예약하기
      </Top.Top03>

      {errorMessage && (
        <div
          css={css`
            padding: 0 24px;
          `}
        >
          <Spacing size={12} />
          <div
            css={css`
              padding: 10px 14px;
              border-radius: 10px;
              background: ${colors.red50};
              display: flex;
              align-items: center;
              gap: 8px;
            `}
          >
            <Text typography="t7" fontWeight="medium" color={colors.red500}>
              {errorMessage}
            </Text>
          </div>
        </div>
      )}

      <Spacing size={24} />

      {/* 예약 조건 입력 */}
      <div
        css={css`
          padding: 0 24px;
        `}
      >
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 조건
        </Text>
        <Spacing size={16} />

        {/* 날짜 */}
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 6px;
          `}
        >
          <Text as="label" htmlFor="date-picker" typography="t7" fontWeight="medium" color={colors.grey600}>
            날짜
          </Text>
          <DatePicker
            id="date-picker"
            value={date}
            onChange={value => setFilter('date', value)}
            min={formatDate(new Date())}
          />
        </div>
        <Spacing size={14} />

        {/* 시간 */}
        <div
          css={css`
            display: flex;
            gap: 12px;
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            `}
          >
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              시작 시간
            </Text>
            <Select value={startTime} onChange={e => setFilter('startTime', e.target.value)} aria-label="시작 시간">
              <option value="">선택</option>
              {getTimeSlots()
                .slice(0, -1)
                .map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </Select>
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            `}
          >
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              종료 시간
            </Text>
            <Select value={endTime} onChange={e => setFilter('endTime', e.target.value)} aria-label="종료 시간">
              <option value="">선택</option>
              {getTimeSlots()
                .slice(1)
                .map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </Select>
          </div>
        </div>
        <Spacing size={14} />

        {/* 참석 인원 + 선호 층 */}
        <div
          css={css`
            display: flex;
            gap: 12px;
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            `}
          >
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              참석 인원
            </Text>
            <input
              type="number"
              min={1}
              value={attendees}
              onChange={e => setFilter('attendees', String(Math.max(1, Number(e.target.value))))}
              aria-label="참석 인원"
              css={css`
                box-sizing: border-box;
                font-size: 16px;
                font-weight: 500;
                line-height: 1.5;
                height: 48px;
                background-color: ${colors.grey50};
                border-radius: 12px;
                color: ${colors.grey800};
                width: 100%;
                border: 1px solid ${colors.grey200};
                padding: 0 16px;
                outline: none;
                transition: border-color 0.15s;
                &:focus {
                  border-color: ${colors.blue500};
                }
              `}
            />
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            `}
          >
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              선호 층
            </Text>
            <Select
              value={preferredFloor ?? ''}
              onChange={e => setFilter('floor', e.target.value || null)}
              aria-label="선호 층"
            >
              <option value="">전체</option>
              {floors.map((f: number) => (
                <option key={f} value={f}>
                  {f}층
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Spacing size={14} />

        {/* 장비 */}
        <div>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
            필요 장비
          </Text>
          <Spacing size={8} />
          <div
            css={css`
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            `}
          >
            {ALL_EQUIPMENT.map(eq => {
              const selected = equipment.includes(eq);
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => {
                    const next = selected ? equipment.filter(e => e !== eq) : [...equipment, eq];
                    setFilter('equipment', next.join(',') || null);
                  }}
                  aria-label={EQUIPMENT_LABELS[eq]}
                  aria-pressed={selected}
                  css={css`
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 1px solid ${selected ? colors.blue500 : colors.grey200};
                    background: ${selected ? colors.blue50 : colors.grey50};
                    color: ${selected ? colors.blue600 : colors.grey700};
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                    &:hover {
                      border-color: ${selected ? colors.blue500 : colors.grey400};
                    }
                  `}
                >
                  {EQUIPMENT_LABELS[eq]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {validationError && (
        <div
          css={css`
            padding: 0 24px;
          `}
        >
          <Spacing size={8} />
          <span
            css={css`
              color: ${colors.red500};
              font-size: 14px;
            `}
            role="alert"
          >
            {validationError}
          </span>
        </div>
      )}

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 가능 회의실 목록 */}
      {isFilterComplete && (
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
              예약 가능 회의실
            </Text>
            <Text typography="t7" fontWeight="medium" color={colors.grey500}>
              {availableRooms.length}개
            </Text>
          </div>
          <Spacing size={16} />

          {availableRooms.length === 0 ? (
            <div
              css={css`
                padding: 40px 0;
                text-align: center;
                background: ${colors.grey50};
                border-radius: 14px;
              `}
            >
              <Text typography="t6" color={colors.grey500}>
                조건에 맞는 회의실이 없습니다.
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
              {availableRooms.map(
                (room: { id: string; name: string; floor: number; capacity: number; equipment: string[] }) => {
                  const isSelected = selectedRoomId === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      role="button"
                      aria-pressed={isSelected}
                      aria-label={room.name}
                      css={css`
                        cursor: pointer;
                        padding: 14px 16px;
                        border-radius: 14px;
                        border: 2px solid ${isSelected ? colors.blue500 : colors.grey200};
                        background: ${isSelected ? colors.blue50 : colors.white};
                        transition: all 0.15s;
                        &:hover {
                          border-color: ${isSelected ? colors.blue500 : colors.grey300};
                        }
                      `}
                    >
                      <ListRow
                        contents={
                          <ListRow.Text2Rows
                            top={room.name}
                            topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                            bottom={`${room.floor}층 · ${room.capacity}명 · ${room.equipment
                              .map((e: string) => EQUIPMENT_LABELS[e])
                              .join(', ')}`}
                            bottomProps={{ typography: 't7', color: colors.grey600 }}
                          />
                        }
                        right={
                          isSelected ? (
                            <Text typography="t7" fontWeight="bold" color={colors.blue500}>
                              선택됨
                            </Text>
                          ) : undefined
                        }
                      />
                    </div>
                  );
                }
              )}
            </div>
          )}

          <Spacing size={16} />
          <Button display="full" onClick={handleBook} disabled={createMutation.isPending}>
            {createMutation.isPending ? '예약 중...' : '확정'}
          </Button>
        </div>
      )}

      <Spacing size={24} />
    </div>
  );
}
