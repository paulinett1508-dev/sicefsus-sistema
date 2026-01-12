#!/bin/bash
# Setup do StatusLine para Claude Code
# Execute na primeira sessão: bash .claude/setup-statusline.sh

SETTINGS_FILE=".claude/settings.json"

# Verificar se statusLine já está configurado
if grep -q '"statusLine"' "$SETTINGS_FILE" 2>/dev/null; then
  echo "StatusLine já está configurado em $SETTINGS_FILE"
  exit 0
fi

# Se settings.json não existe, criar estrutura básica
if [ ! -f "$SETTINGS_FILE" ]; then
  echo "Criando $SETTINGS_FILE..."
  cat > "$SETTINGS_FILE" << 'EOFJ'
{
  "statusLine": {
    "type": "command",
    "command": "bash /home/runner/workspace/.claude/statusline.sh"
  }
}
EOFJ
  echo "StatusLine configurado com sucesso!"
  exit 0
fi

# Se existe mas não tem statusLine, informar para adicionar manualmente
echo "Adicione a seguinte configuração ao início do seu $SETTINGS_FILE:"
echo ""
echo '  "statusLine": {'
echo '    "type": "command",'
echo '    "command": "bash /home/runner/workspace/.claude/statusline.sh"'
echo '  },'
echo ""
echo "Ou use o comando: /statusline"
