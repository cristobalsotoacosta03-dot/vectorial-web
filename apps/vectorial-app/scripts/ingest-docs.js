#!/usr/bin/env node

/**
 * Script de ingesta de documentos técnicos desde NotebookLM
 * 
 * Funcionalidad:
 * - Lee archivos Markdown y PDF de docs/referencia/
 * - Extrae y estructura el contenido
 * - Genera un índice JSON para consulta rápida
 * - Crea un archivo de contexto consolidado para el asistente
 * 
 * Uso: npm run ingest:docs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs/referencia');
const OUTPUT_DIR = path.join(ROOT_DIR, 'docs/output');

const CATEGORIES = {
  'normativas': 'Normativas UNE, RITE, CTE',
  'calculos': 'Métodos de cálculo y fórmulas',
  'materiales': 'Catálogos y fichas técnicas',
  'ejemplos': 'Casos prácticos y ejemplos'
};

/**
 * Extrae metadatos del contenido Markdown
 */
function parseMarkdown(content, filePath) {
  const lines = content.split('\n');
  const metadata = {
    titulo: '',
    categoria: path.basename(path.dirname(filePath)),
    ruta: path.relative(ROOT_DIR, filePath),
    fechaModificacion: new Date().toISOString(),
    referencias: [],
    secciones: []
  };

  let currentSection = null;
  let sectionContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar título principal
    if (line.startsWith('# ') && !metadata.titulo) {
      metadata.titulo = line.replace('# ', '').trim();
      continue;
    }

    // Detectar secciones
    if (line.startsWith('## ')) {
      if (currentSection) {
        metadata.secciones.push({
          titulo: currentSection,
          contenido: sectionContent.join('\n').trim()
        });
      }
      currentSection = line.replace('## ', '').trim();
      sectionContent = [];
      continue;
    }

    // Detectar referencias normativas
    if (line.match(/UNE\s+\d+|RITE|CTE|REBT|ITC/i)) {
      const ref = line.match(/(UNE\s+[\d\.\-\/]+(?:\:\d+)?|RITE|CTE|REBT|ITC[\-\d\.]*)/i);
      if (ref && !metadata.referencias.includes(ref[0])) {
        metadata.referencias.push(ref[0]);
      }
    }

    if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Última sección
  if (currentSection && sectionContent.length > 0) {
    metadata.secciones.push({
      titulo: currentSection,
      contenido: sectionContent.join('\n').trim()
    });
  }

  return metadata;
}

/**
 * Procesa un archivo Markdown
 */
async function processMarkdown(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const metadata = parseMarkdown(content, filePath);
  
  return {
    tipo: 'markdown',
    ...metadata,
    contenido: content
  };
}

/**
 * Procesa un archivo PDF (placeholder - requiere pdf-parse)
 * Nota: Para implementar completamente, instalar: npm install pdf-parse
 */
async function processPDF(filePath) {
  // Por ahora, solo registramos el archivo PDF
  // Para extraer texto, necesitarías instalar pdf-parse
  console.warn(`⚠️  PDF detectado (${path.basename(filePath)}): requiere pdf-parse para extraer texto`);
  
  return {
    tipo: 'pdf',
    titulo: path.basename(filePath, '.pdf'),
    categoria: path.basename(path.dirname(filePath)),
    ruta: path.relative(ROOT_DIR, filePath),
    fechaModificacion: new Date().toISOString(),
    contenido: `[PDF: ${path.basename(filePath)} - Instalar pdf-parse para extraer texto]`,
    referencias: [],
    secciones: []
  };
}

/**
 * Procesa recursivamente una carpeta
 */
async function processDirectory(dir, results = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath, results);
    } else if (entry.name.endsWith('.md')) {
      console.log(`📄 Procesando Markdown: ${entry.name}`);
      const doc = await processMarkdown(fullPath);
      results.push(doc);
    } else if (entry.name.endsWith('.pdf')) {
      console.log(`📕 Procesando PDF: ${entry.name}`);
      const doc = await processPDF(fullPath);
      results.push(doc);
    }
  }

  return results;
}

/**
 * Genera el índice de documentos
 */
function generateIndex(documents) {
  const index = {
    generado: new Date().toISOString(),
    totalDocumentos: documents.length,
    porCategoria: {},
    documentos: documents.map(doc => ({
      titulo: doc.titulo,
      tipo: doc.tipo,
      categoria: doc.categoria,
      ruta: doc.ruta,
      referencias: doc.referencias,
      numSecciones: doc.secciones.length
    }))
  };

  // Agrupar por categoría
  for (const doc of documents) {
    if (!index.porCategoria[doc.categoria]) {
      index.porCategoria[doc.categoria] = [];
    }
    index.porCategoria[doc.categoria].push({
      titulo: doc.titulo,
      ruta: doc.ruta
    });
  }

  return index;
}

/**
 * Genera archivo de contexto consolidado para el asistente
 */
function generateContextFile(documents) {
  const lines = [
    '# Contexto Técnico Consolidado',
    `Generado: ${new Date().toISOString()}`,
    `Total documentos: ${documents.length}`,
    '',
    '---',
    ''
  ];

  // Agrupar por categoría
  const byCategory = {};
  for (const doc of documents) {
    if (!byCategory[doc.categoria]) {
      byCategory[doc.categoria] = [];
    }
    byCategory[doc.categoria].push(doc);
  }

  // Generar contenido por categoría
  for (const [categoria, docs] of Object.entries(byCategory)) {
    const categoriaNombre = CATEGORIES[categoria] || categoria;
    lines.push(`## ${categoriaNombre}`);
    lines.push('');

    for (const doc of docs) {
      lines.push(`### ${doc.titulo}`);
      lines.push('');
      lines.push(`**Ruta:** ${doc.ruta}`);
      lines.push('');

      if (doc.referencias.length > 0) {
        lines.push('**Referencias normativas:**');
        for (const ref of doc.referencias) {
          lines.push(`- ${ref}`);
        }
        lines.push('');
      }

      // Incluir secciones principales
      if (doc.secciones && doc.secciones.length > 0) {
        for (const seccion of doc.secciones.slice(0, 5)) { // Limitar a 5 secciones por doc
          lines.push(`#### ${seccion.titulo}`);
          lines.push('');
          // Limitar contenido por sección
          const contenido = seccion.contenido.split('\n').slice(0, 20).join('\n');
          lines.push(contenido);
          lines.push('');
        }
      }

      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('🚀 Iniciando ingesta de documentos técnicos...\n');

    // Verificar que existe la carpeta de documentos
    try {
      await fs.access(DOCS_DIR);
    } catch {
      console.error(`❌ Error: No se encuentra la carpeta ${DOCS_DIR}`);
      console.log('   Crea la carpeta y coloca tus documentos exportados de NotebookLM.');
      process.exit(1);
    }

    // Crear carpeta de salida
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Procesar documentos
    console.log('📂 Escaneando docs/referencia/...\n');
    const documents = await processDirectory(DOCS_DIR);

    if (documents.length === 0) {
      console.warn('⚠️  No se encontraron documentos para procesar.');
      console.log('   Coloca archivos .md o .pdf en docs/referencia/');
      process.exit(0);
    }

    console.log(`\n✅ Procesados ${documents.length} documentos\n`);

    // Generar índice
    const index = generateIndex(documents);
    const indexPath = path.join(OUTPUT_DIR, 'indice.json');
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`📊 Índice generado: ${path.relative(ROOT_DIR, indexPath)}`);

    // Generar archivo de contexto
    const contextContent = generateContextFile(documents);
    const contextPath = path.join(OUTPUT_DIR, 'contexto-tecnico.md');
    await fs.writeFile(contextPath, contextContent, 'utf-8');
    console.log(`📝 Contexto generado: ${path.relative(ROOT_DIR, contextPath)}`);

    // Resumen
    console.log('\n📈 Resumen por categoría:');
    for (const [categoria, docs] of Object.entries(index.porCategoria)) {
      const nombre = CATEGORIES[categoria] || categoria;
      console.log(`   ${nombre}: ${docs.length} documentos`);
    }

    console.log('\n✨ Ingesta completada exitosamente!');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Revisa docs/output/indice.json para ver el índice completo');
    console.log('   2. Consulta docs/output/contexto-tecnico.md para el contexto consolidado');
    console.log('   3. Al programar, el asistente priorizará la información de docs/referencia/');

  } catch (error) {
    console.error('\n❌ Error durante la ingesta:', error.message);
    process.exit(1);
  }
}

main();