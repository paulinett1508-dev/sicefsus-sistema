# Auditoria de CSS - Padronização de Estilos

Analise todos os arquivos CSS/SCSS e componentes styled:

## 1. Cores
- Liste TODAS as cores usadas (hex, rgb, hsl)
- Identifique cores similares que deveriam ser a mesma
- Verifique se cores estão em variáveis CSS ou hardcoded
- Mapeie: cor → onde é usada

## 2. Tipografia
- Liste todas as font-family usadas
- Liste todos os font-size (devem ser poucos: 12, 14, 16, 18, 24, 32...)
- Verifique font-weight consistente
- Line-heights padronizados?

## 3. Espaçamentos
- Liste todos os valores de margin e padding
- Identifique se seguem escala (4, 8, 12, 16, 24, 32...)
- Gaps em flexbox/grid consistentes?

## 4. Bordas e Sombras
- border-radius: quantos valores diferentes?
- box-shadow: padronizados ou cada um diferente?
- border-color: consistente com paleta?

## 5. Variáveis CSS
- Existem variáveis definidas em :root?
- Estão sendo usadas ou há valores hardcoded?
- Sugerir variáveis para valores repetidos

## Resultado Esperado
```css
/* Paleta de cores sugerida */
:root {
  --primary: #???;
  --secondary: #???;
  --success: #???;
  --warning: #???;
  --error: #???;
  --background: #???;
  --text: #???;
}
```

Gere arquivo `DESIGN_SYSTEM.md` com padrões identificados.