// src/hooks/usePageTitle.js
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

// Como usar nos componentes:

// Em Dashboard.jsx
import { usePageTitle } from '../hooks/usePageTitle';

export default function Dashboard() {
  usePageTitle('Dashboard');
  // resto do componente...
}

// Em Relatorios.jsx
import { usePageTitle } from '../hooks/usePageTitle';

export default function Relatorios() {
  usePageTitle('Relatórios');
  // resto do componente...
}

// Em Despesas.jsx
import { usePageTitle } from '../hooks/usePageTitle';

export default function Despesas() {
  usePageTitle('Despesas');
  // resto do componente...
}