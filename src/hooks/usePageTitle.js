
import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    const baseTitle = 'SICEFSUS';
    document.title = title ? `${title} - ${baseTitle}` : baseTitle;

    // Cleanup: volta ao título padrão quando o componente desmonta
    return () => {
      document.title = baseTitle;
    };
  }, [title]);
};
