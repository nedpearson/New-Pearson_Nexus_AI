import { ReactNode } from 'react';
import { useUiMode } from '../../state/uiMode';

interface AdvancedOnlyProps {
  children: ReactNode;
}

export function AdvancedOnly({ children }: AdvancedOnlyProps) {
  const { mode } = useUiMode();

  if (mode === 'simple') {
    return null;
  }

  return <>{children}</>;
}
