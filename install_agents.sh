#!/bin/bash

# 🚀 Antigravity Agent System Installer
# Uso: ./install_agents.sh /ruta/a/tu/proyecto

DEST_PROJECT=$1

if [ -z "$DEST_PROJECT" ]; then
    echo "❌ Error: Debes proporcionar la ruta de destino."
    echo "Uso: ./install_agents.sh /ruta/a/tu/proyecto"
    exit 1
fi

# Convertir a ruta absoluta
DEST_PROJECT=$(cd "$DEST_PROJECT" && pwd)

echo "🛰️ Iniciando migración del Agent OS a: $DEST_PROJECT"

# 1. Crear directorios base
mkdir -p "$DEST_PROJECT/skills"
mkdir -p "$DEST_PROJECT/knowledge_base/context_notebooks"
mkdir -p "$DEST_PROJECT/knowledge_base/adr"
mkdir -p "$DEST_PROJECT/knowledge_base/master_intelligence"

# 2. Copiar Reglas Globales
cp "/Users/angel/.gemini/antigravity/scratch/agent_system/.cursorrules" "$DEST_PROJECT/"

# 3. Copiar Skills de Agentes
cp -R "/Users/angel/.gemini/antigravity/scratch/agent_system/skills/"* "$DEST_PROJECT/skills/"

# 4. Copiar Master Intelligence (Aprendizaje Acumulado)
cp -R "/Users/angel/.gemini/antigravity/scratch/agent_system/knowledge_base/master_intelligence/"* "$DEST_PROJECT/knowledge_base/master_intelligence/"
echo "🧬 Inteligencia Acumulada (Master Intelligence) migrada correctamente."

# 5. Inicializar Cuaderno de Sincronización (si no existe)
if [ ! -f "$DEST_PROJECT/knowledge_base/context_notebooks/sincronizacion_global.md" ]; then
    cp "/Users/angel/.gemini/antigravity/scratch/agent_system/knowledge_base/context_notebooks/sincronizacion_global.md" "$DEST_PROJECT/knowledge_base/context_notebooks/"
    echo "📓 Cuaderno de Sincronización Global inicializado."
else
    echo "⚠️ El cuaderno de sincronización ya existe, no se ha sobrescrito."
fi

echo "✅ Sistema de Agentes Élite instalado correctamente."
echo "👉 Ahora abre tu proyecto en Cursor y pide al CTO que active el protocolo."
