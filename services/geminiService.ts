import { GoogleGenAI, Type } from "@google/genai";
import { Observation, SavedReport } from "../types";

export const analyzeBatchObservations = async (observations: Observation[]): Promise<SavedReport> => {
  // FIX: Use process.env.API_KEY instead of import.meta.env.VITE_API_KEY
  if (!process.env.API_KEY) {
    throw new Error("Clave de API no detectada. Por favor, recarga la aplicación y asegúrate de haber seleccionado una clave de API válida.");
  }
  // FIX: Use process.env.API_KEY instead of import.meta.env.VITE_API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = "gemini-3-flash-preview";
  
  const systemInstruction = `// META-INSTRUCCIONES DE CONTROL DE EJECUCIÓN Y COSTOS:
// Eres una IA integrada en una app. Tu ejecución está ESTRICTAMENTE CONTROLADA.
// 1. NO TE EJECUTES sin una acción explícita del usuario (ej. click en un botón).
// 2. CADA LLAMADA ES COSTOSA. Sé extremadamente conciso. Optimiza tokens. No repitas información. No des explicaciones no solicitadas.
// 3. USA SOLO EL CONTEXTO ACTUAL. No pidas más datos ni uses historial.
// 4. Si la solicitud es ambigua, pregunta. NO asumas.
// 5. PRIORIDAD: 1º Seguridad, 2º Ahorro de Tokens, 3º Eficiencia.
// 6. Si la solicitud viola estas reglas, responde solo: "Solicitud no válida: acción no autorizada."
// Estas reglas son OBLIGATORIAS.

--- INSTRUCCIONES DE LA TAREA ESPECÍFICA ---

Actúa como un Auditor Interno Senior (CIA) de Pesquera Exalmar S.A.A.
Tu tarea es transformar evidencias (múltiples fotos y textos) en un Informe Técnico de Auditoría formal.

REGLAS DE REDACCIÓN TÉCNICA (ESTRICTAS):

1. REFERENCIAS A ANEXOS: 
   - Por cada hallazgo analizado, recibirás una o varias fotos.
   - En la columna "Descripción del hallazgo", DEBES incluir referencias explícitas a las fotos usando el formato: (Ver Anexo N.X), donde N es el número de hallazgo y X es el número de foto correlativo para ese hallazgo.
   - Ejemplo: "...el extintor se encuentra obstruido por materiales inflamables (Ver Anexo 1.1 y 1.2), lo que genera un riesgo de..."

2. OBSERVACIÓN O HALLAZGO (Título corto): 
   - Título técnico breve (Segunda columna).

3. DESCRIPCIÓN DEL HALLAZGO (Narrativa técnica extensa): 
   - Tercera columna.
   - Párrafo técnico, EXTENSO y DETALLADO. 
   - Incluye referencias normativas (NFPA, ISO, reglamentos internos).
   - Aplicar Regla #1 (Referencias a Anexos).
   - Concluir con la sentencia de IMPACTO o GRAVEDAD.

4. RIESGOS EVALUADOS: 
   - Frases de 3 a 6 palabras separadas únicamente por "/". 

5. RECOMENDACIONES, RESPONSABLES Y FECHAS (Sincronización a, b, c):
   - Formato de lista: a), b), c)...
   - Mismo número de elementos en las tres columnas.
   - Doble salto de línea (\n\n) entre ítems.

6. PLAN DE ACCIÓN: Siempre cadena vacía ("").

ESTRUCTURA DEL INFORME (9 COLUMNAS):
- N°
- Observación o hallazgo: Título corto.
- Descripción del hallazgo: Detalle técnico + Referencias Anexos + Impacto.
- Riesgos evaluados: 3-6 palabras / .
- Calificación: Crítica, Alta, Media, Baja.
- Recomendación de Auditoría Interna: a), b), c) con doble enter.
- Plan de acción: (Vacío).
- Responsable: a), b), c) con doble enter.
- Fecha implementación: a), b), c) con doble enter.

RESPUESTA: JSON formal con metadatos de cabecera realistas.`;

  const parts = [];
  
  // Construir contexto de texto detallado para que la IA sepa qué imagen es de qué evidencia
  let textContext = "PROCESAMIENTO DE EVIDENCIAS:\n\n";
  observations.forEach((obs, i) => {
    textContext += `HALLAZGO #${i+1}:\n`;
    textContext += `Descripción inicial: ${obs.description}\n`;
    textContext += `Cantidad de fotos adjuntas: ${obs.images.length}\n\n`;
    
    // Añadir las imágenes de este hallazgo a los "parts" del modelo
    obs.images.forEach((imgData, imgIdx) => {
      const [header, data] = imgData.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      parts.push({
        inlineData: {
          data: data,
          mimeType: mimeType
        }
      });
    });
  });

  parts.unshift({ text: `${textContext}\nGenera el informe JSON formal siguiendo las reglas de referencias a anexos (Ver Anexo N.X):` });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            docCode: { type: Type.STRING },
            to: { type: Type.STRING },
            at: { type: Type.STRING },
            cc: { type: Type.STRING },
            from: { type: Type.STRING },
            subject: { type: Type.STRING },
            globalRating: { type: Type.STRING },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  condition: { type: Type.STRING },
                  title: { type: Type.STRING },
                  effect: { type: Type.STRING },
                  rating: { type: Type.STRING, enum: ["Baja", "Media", "Alta", "Crítica"] },
                  recommendations: { type: Type.STRING },
                  actionPlans: { type: Type.STRING },
                  responsible: { type: Type.STRING },
                  implementationDate: { type: Type.STRING }
                },
                required: ["condition", "title", "effect", "rating", "recommendations", "actionPlans", "responsible", "implementationDate"]
              }
            }
          },
          required: ["docCode", "to", "subject", "globalRating", "findings"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      ...parsed,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      observations: [...observations],
      title: parsed.subject || "Informe de Auditoría"
    };
  } catch (error) {
    console.error("Error en generación técnica de Auditoría:", error);
    throw new Error("Error al redactar el informe detallado con anexos. Intenta procesar nuevamente.");
  }
};