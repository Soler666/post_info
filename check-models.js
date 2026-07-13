import 'dotenv/config';

async function buscarModelos() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ No se encontró la API Key en el .env");
    return;
  }

  console.log("🔍 Buscando modelos en los servidores de Google...");
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("\n✅ Nombres EXACTOS que puedes usar en tu código:");
    data.models.forEach(model => {
      // Filtramos solo los que sirven para generar texto (generateContent)
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`-> ${model.name.replace('models/', '')}`);
      }
    });
    console.log("\n(Copia uno que diga 'pro' o 'flash' y ponlo en tu script)");
  } catch (error) {
    console.error("Error al buscar:", error);
  }
}

buscarModelos();