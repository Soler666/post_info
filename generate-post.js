import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import Groq from 'groq-sdk';
import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// 1. Extraer texto del documento (Word, PDF o TXT)
async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else if (ext === '.pdf') {
    const dataBuffer = await fs.readFile(filePath);
    
    // Intento de carga a prueba de fallos para pdf-parse en Node 22+
    const pdfParseRaw = require('pdf-parse');
    const parseFunction = typeof pdfParseRaw === 'function' 
      ? pdfParseRaw 
      : (pdfParseRaw.default || Object.values(pdfParseRaw).find(f => typeof f === 'function'));
      
    if (typeof parseFunction !== 'function') {
      throw new Error('❌ Node.js 22 bloqueó completamente pdf-parse. SOLUCIÓN RÁPIDA: Abre tu PDF, cópialo en un archivo .txt o guárdalo como .docx y pasa ese archivo al script.');
    }
    
    const data = await parseFunction(dataBuffer);
    return data.text;
  } else if (ext === '.txt') {
    return await fs.readFile(filePath, 'utf-8');
  } else {
    throw new Error('❌ Formato no soportado. Usa un archivo .docx, .pdf o .txt');
  }
}

// 2. Buscar foto en Unsplash
async function getUnsplashImage(searchQuery) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return '/images/placeholder-default.jpg';

  console.log(`📸 Buscando foto de portada en Unsplash para: "${searchQuery}"...`);
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&client_id=${accessKey}&per_page=1&orientation=landscape`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      console.log('✅ ¡Foto encontrada!');
      return data.results[0].urls.regular;
    }
  } catch (error) {
    console.error('❌ Error con Unsplash:', error.message);
  }
  return '/images/placeholder-default.jpg';
}

function sanitizeFilename(input) {
  return String(input).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
}

// 3. Generar el artículo con Groq actuando como Editor
async function generateMarkdown({ sourceText, topic, imageUrl }) {
  const apiKey = process.env.GROQ_API_KEY;
  const groq = new Groq({ apiKey });

  console.log(`✅ Conectando con Groq (Aplicando plantilla de revista)...`);

  const prompt = `You are the elite Editor-in-Chief of a Tech/IT magazine.

TASK:
I am providing you with rough notes/raw data from a document. Rewrite this information into a 100% ORIGINAL, polished article in ENGLISH (US).
Style: Wired / TechCrunch tech journalism. Clean, engaging, and professional.
Length: Expand and structure the provided data to 900-1400 words if possible.

CONSTRAINTS:
1) Base the facts on the provided SOURCE MATERIAL.
2) Structure with clear, catchy headings (H2/H3).
3) Include bullet points or blockquotes (>) to highlight key data.
4) Do not invent fake quotes, but you can extrapolate logical tech conclusions.

OUTPUT FORMAT:
Return ONLY valid Astro markdown with this exact frontmatter block at the very top:
---
title: "<Catchy click-optimized SEO Title>"
description: "<150 character summary>"
pubDate: "${new Date().toISOString()}"
category: "Tech News"
tags: ["Tech", "IT", "Innovation"]
heroImage: "${imageUrl}"
---

Then the article body in markdown. DO NOT wrap the output in markdown code blocks (\`\`\`).

SOURCE MATERIAL TO REWRITE:
${sourceText}
`;

  console.log(`⏳ Redactando, corrigiendo y estructurando el artículo...`);
  
  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile', 
    temperature: 0.5, 
  });

  const text = response.choices[0]?.message?.content;
  if (!text || !text.trim()) throw new Error('El modelo devolvió un texto vacío');
  
  return text.trim().replace(/^```(?:markdown)?\n/, '').replace(/\n```$/, '');
}

async function main() {
  try {
    const inputPath = process.argv.slice(2).join(' ').trim();
    if (!inputPath) {
      console.error('❌ Error: Debes pasar la ruta del archivo. Ejemplo: node generate-post.js "borradores/noticia.docx"');
      process.exit(1);
    }

    const absolutePath = path.resolve(process.cwd(), inputPath);
    const fileNameBase = path.basename(absolutePath, path.extname(absolutePath)).replace(/-/g, ' ');

    console.log(`📄 Leyendo archivo: ${absolutePath}`);
    const sourceText = await extractTextFromFile(absolutePath);

    const outputDir = path.join(process.cwd(), 'src/content/blog');
    await fs.mkdir(outputDir, { recursive: true });

    const imageUrl = await getUnsplashImage(fileNameBase);
    const articleMd = await generateMarkdown({ sourceText, topic: fileNameBase, imageUrl });

    const titleMatch = articleMd.match(/^title:\s*"?([\s\S]*?)"?\n/m);
    const rawTitle = titleMatch ? titleMatch[1] : fileNameBase;
    const finalName = sanitizeFilename(rawTitle || fileNameBase) || 'post';
    
    let finalPath = path.join(outputDir, `${finalName}.md`);
    try {
      await fs.access(finalPath);
      finalPath = path.join(outputDir, `${finalName}-${Date.now()}.md`);
    } catch {}

    await fs.writeFile(finalPath, articleMd, 'utf-8');
    console.log(`🎉 ¡Éxito! Revista generada y guardada en: ${path.relative(process.cwd(), finalPath)}`);
    
  } catch (err) {
    console.error('❌ El script falló:', err?.message || err);
    process.exit(1);
  }
}

main();