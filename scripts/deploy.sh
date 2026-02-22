#!/bin/bash
# ============================================
# Home Garden Manual - Build Script
# Para teste local antes do deploy
# ============================================

set -e

echo "🌱 Home Garden Manual - Build Script"
echo "====================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "   Instale Node.js 20+ para continuar."
    exit 1
fi

echo "📦 Versão do Node.js: $(node -v)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --legacy-peer-deps

# Build de produção
echo ""
echo "🔨 Gerando build de produção..."
npm run build

echo ""
echo "✅ Build concluído com sucesso!"
echo ""
echo "📁 Arquivos gerados em: ./dist"
echo "   - index.html"
echo "   - assets/ (JS, CSS, imagens)"
echo ""
echo "📋 Próximos passos:"
echo "   1. git add ."
echo "   2. git commit -m 'feat: production build'"
echo "   3. git push origin main"
echo "   4. EasyPanel fará o deploy automático"
echo "   5. Verifique https://homegardenmanual.com"
echo ""
echo "🚀 Deploy automático configurado!"
