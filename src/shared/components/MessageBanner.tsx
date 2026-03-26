import { css } from '@emotion/react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';

interface Props {
  text: string;
  backgroundColor: string;
  textColor: string;
}

export function MessageBanner({ backgroundColor, textColor, text }: Props) {
  return (
    <div
      css={css`
        padding: 10px 14px;
        border-radius: 10px;
        background: ${backgroundColor};
        display: flex;
        align-items: center;
        gap: 8px;
      `}
    >
      <Text typography="t7" fontWeight="medium" color={textColor}>
        {text}
      </Text>
    </div>
  );
}
