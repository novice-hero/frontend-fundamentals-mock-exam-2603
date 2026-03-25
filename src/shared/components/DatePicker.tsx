import { css } from '@emotion/react';
import { colors } from '_tosslib/constants/colors';

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  ariaLabel?: string;
}

export function DatePicker({ id, value, onChange, min, ariaLabel = '날짜' }: Props) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      min={min}
      aria-label={ariaLabel}
      onChange={e => onChange(e.target.value)}
      css={css`
        box-sizing: border-box; font-size: 16px; font-weight: 500; line-height: 1.5; height: 48px;
        background-color: ${colors.grey50}; border-radius: 12px; color: ${colors.grey800};
        width: 100%; border: 1px solid ${colors.grey200}; padding: 0 16px; outline: none;
        transition: border-color 0.15s; &:focus { border-color: ${colors.blue500}; }
      `}
    />
  );
}
