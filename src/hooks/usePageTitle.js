
import { useEffect } from 'react';

const usePageTitle = (title) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} - SICEFSUS`;
    } else {
      document.title = 'SICEFSUS - Sistema de Controle de Execuções Financeiras do SUS';
    }
  }, [title]);
};

export default usePageTitle;
