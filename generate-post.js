import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import Groq from 'groq-sdk';

function sanitizeFilename(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function generateMarkdown({ topic }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('❌ Falta la variable GROQ_API_KEY en tu archivo .env');
  }

  // Inicializamos Groq
  const groq = new Groq({ apiKey });

  console.log(`✅ Conectando con Groq (Llama 3 70B - 100% Gratuito y Sin Bloqueos)...`);

  const prompt = `You are an elite tech editor and researcher.

TASK:
Write a 100% ORIGINAL article in ENGLISH (US).
Style: Wired / TechCrunch tech journalism.
Length: 900-1400 words.
Focus niche: Next-Gen Makers (Advanced Resin 3D Printing, AI Workflows for Creators, and Tech Hardware).

CONSTRAINTS:
1) Act as if you have up-to-date knowledge of the industry.
2) Include specific, accurate details (no generic filler).
3) Use clear headings (H2/H3).
4) Include at least 5 actionable takeaways.
5) Mention 1-2 relevant tools/standards/products.
6) Add a short "Common Mistakes" section.

OUTPUT FORMAT:
Return ONLY valid Astro markdown with this exact frontmatter block at the very top:
---
title: "<Catchy click-optimized SEO Title>"
description: "<150 character summary>"
pubDate: "${new Date().toISOString()}"
category: "Tech News"
tags: ["Tech", "Makers", "Innovation"]
heroImage: "/blog-placeholder-1.jpg"
---

Then the article body in markdown. DO NOT include markdown code blocks (\`\`\`) wrapping the output, just return the raw text starting directly with the --- of the frontmatter.

TOPIC:
${topic}
`;

  console.log(`⏳ Redactando artículo a la velocidad de la luz...`);
  
  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile', // El modelo nuevo y actualizado 
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content;

  if (!text || !text.trim()) throw new Error('El modelo devolvió un texto vacío');
  
  return text.trim().replace(/^```(?:markdown)?\n/, '').replace(/\n```$/, '');
}

async function main() {
  try {
    const topic = process.argv.slice(2).join(' ').trim();
    if (!topic) {
      console.error('❌ Error: Debes incluir el tema. Ejemplo: node generate-post.js "Latest 3D printing resins"');
      process.exit(1);
    }

    const outputDir = path.join(process.cwd(), 'src/content/blog');
    await fs.mkdir(outputDir, { recursive: true });

    const articleMd = await generateMarkdown({ topic });

    const titleMatch = articleMd.match(/^title:\s*"?([\s\S]*?)"?\n/m);
    const rawTitle = titleMatch ? titleMatch[1] : topic;
    const filenameBase = sanitizeFilename(rawTitle || topic) || 'post';
    const filename = `${filenameBase}.md`;

    let finalPath = path.join(outputDir, filename);

    try {
      await fs.access(finalPath);
      const ts = Date.now();
      finalPath = path.join(outputDir, `${filenameBase}-${ts}.md`);
    } catch {
      // Archivo nuevo
    }

    await fs.writeFile(finalPath, articleMd, 'utf-8');
    console.log(`🎉 ¡Éxito! Artículo generado y guardado en: ${path.relative(process.cwd(), finalPath)}`);
    
  } catch (err) {
    console.error('❌ El script falló:', err?.message || err);
    process.exit(1);
  }
}

main();