import React from 'react';
import './shared-styles.css';

function ResultTable({ colunas, dados, loading, mensagemVazia = 'Nenhum resultado encontrado' }) {
  if (loading) {
    return (
      <div className="result-table-loading">
        <div className="spinner-grande"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (!dados || dados.length === 0) {
    return (
      <div className="result-table-vazia">
        <span className="icone-vazio">📭</span>
        <p>{mensagemVazia}</p>
      </div>
    );
  }

  return (
    <div className="result-table-container">
      <table className="result-table">
        <thead>
          <tr>
            {colunas.map((col, index) => (
              <th key={index} style={{ width: col.width || 'auto' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((linha, indexLinha) => (
            <tr key={indexLinha}>
              {colunas.map((col, indexCol) => (
                <td key={indexCol}>
                  {col.render ? col.render(linha[col.key], linha) : linha[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultTable;
