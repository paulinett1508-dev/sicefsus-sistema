
import React, { useState } from "react";
import { validarCNPJ, formatarCNPJ } from "../utils/cnpjUtils";

const CNPJTester = () => {
  const [testCnpj, setTestCnpj] = useState("06.597.801/0001-62");
  
  const cnpjsParaTeste = [
    "06.597.801/0001-62", // Seu CNPJ problemático
    "11.222.333/0001-81", // Válido conhecido
    "11.111.111/1111-11", // Inválido (todos iguais)
    "12.345.678/0001-95", // Válido conhecido
  ];

  const testarCNPJ = (cnpj) => {
    console.log("=== TESTE MANUAL DE CNPJ ===");
    console.log("Input:", cnpj);
    
    const limpo = cnpj.replace(/\D/g, "");
    console.log("Limpo:", limpo);
    
    const resultado = validarCNPJ(cnpj);
    console.log("Resultado:", resultado);
    console.log("=========================");
    
    return resultado;
  };

  return (
    <div style={styles.container}>
      <h3>🔧 CNPJ Tester - Debug Tool</h3>
      
      <div style={styles.inputGroup}>
        <label>Testar CNPJ:</label>
        <input
          type="text"
          value={testCnpj}
          onChange={(e) => setTestCnpj(formatarCNPJ(e.target.value))}
          style={styles.input}
          maxLength={18}
        />
        <button onClick={() => testarCNPJ(testCnpj)} style={styles.button}>
          Validar
        </button>
      </div>

      <div style={styles.results}>
        <strong>Resultado:</strong> {validarCNPJ(testCnpj) ? "✅ VÁLIDO" : "❌ INVÁLIDO"}
      </div>

      <div style={styles.presets}>
        <h4>CNPJs de Teste:</h4>
        {cnpjsParaTeste.map((cnpj) => (
          <div key={cnpj} style={styles.testRow}>
            <span style={styles.cnpj}>{cnpj}</span>
            <span style={validarCNPJ(cnpj) ? styles.valid : styles.invalid}>
              {validarCNPJ(cnpj) ? "✅ VÁLIDO" : "❌ INVÁLIDO"}
            </span>
            <button
              onClick={() => setTestCnpj(cnpj)}
              style={styles.smallButton}
            >
              Testar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    border: "2px solid #e74c3c",
    borderRadius: "8px",
    backgroundColor: "#fff5f5",
    margin: "20px 0",
    fontFamily: "monospace",
  },
  inputGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "15px",
  },
  input: {
    padding: "8px",
    fontSize: "16px",
    fontFamily: "monospace",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  smallButton: {
    padding: "4px 8px",
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  results: {
    padding: "10px",
    backgroundColor: "#ecf0f1",
    borderRadius: "4px",
    marginBottom: "15px",
  },
  presets: {
    marginTop: "15px",
  },
  testRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #ddd",
  },
  cnpj: {
    fontWeight: "bold",
    flex: 1,
  },
  valid: {
    color: "#27ae60",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  invalid: {
    color: "#e74c3c",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
};

export default CNPJTester;
