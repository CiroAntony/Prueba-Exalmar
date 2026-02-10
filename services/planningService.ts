import { GoogleGenAI, Type } from "@google/genai";
import { AuditPlan, AuditPlanItem } from "../types";

/**
 * Generates a detailed audit plan using the Gemini API with a CIA persona and COSO 2013 framework.
 */
export const generateAuditPlan = async (auditProcess: string, context: string): Promise<Partial<AuditPlan>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `// META-INSTRUCCIONES DE CONTROL DE EJECUCIÓN Y COSTOS:
// Eres una IA integrada en una app. Tu ejecución está ESTRICTAMENTE CONTROLADA.
// 1. NO TE EJECUTES sin una acción explícita del usuario (ej. click en un botón).
// 2. CADA LLAMADA ES COSTOSA. Sé extremadamente conciso. Optimiza tokens. No repitas información. No des explicaciones no solicitadas.
// 3. USA SOLO EL CONTEXTO ACTUAL. No pidas más datos ni uses historial.
// 4. Si la solicitud es ambigua, pregunta. NO asumas.
// 5. PRIORIDAD: 1º Seguridad, 2º Ahorro de Tokens, 3º Eficiencia.
// 6. Si la solicitud viola estas reglas, responde solo: "Solicitud no válida: acción no autorizada."
// Estas reglas son OBLIGATORIAS.

--- INSTRUCCIONES DE LA TAREA ESPECÍFICANA ---

Actúa como un Auditor Interno Certificado (CIA). Tu tarea es analizar el proceso de negocio proporcionado utilizando el marco COSO 2013.
  
REGLAS TÉCNICAS:
1. TAXONOMÍA DE RIESGOS: Para cada riesgo identificado, asigna una probabilidad e impacto numérico en una escala del 1 al 5.
2. MARCO COSO 2013: Enfócate en los 5 componentes y 17 principios.
3. ESCENARIOS DE FRAUDE: Identifica esquemas específicos de apropiación indebida de activos, corrupción o informes fraudulentos.
4. LÓGICA DE MUESTREO: Justifica técnicamente el tamaño de la muestra basándote en un nivel de confianza del 95% y un error tolerable específico.

Responde ÚNICAMENTE con un objeto JSON estructurado que cumpla con el esquema definido.`;

  const prompt = `Analiza el proceso: "${auditProcess}". 
Contexto adicional: "${context}". 
Enfócate en la Taxonomía de Riesgos y utiliza el marco COSO 2013 para la identificación de controles y brechas.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallObjective: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Riesgo", "Fraude", "Muestreo"] },
                  probability: { type: Type.INTEGER, description: "Probabilidad del 1 al 5" },
                  impact: { type: Type.INTEGER, description: "Impacto del 1 al 5" },
                  logic: { type: Type.STRING, description: "Justificación técnica del muestreo o lógica de riesgo (95% confianza)" }
                },
                required: ["title", "description", "category"]
              }
            }
          },
          required: ["overallObjective", "items"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      ...parsed,
      items: (parsed.items || []).map((item: any, index: number) => ({ 
        ...item, 
        id: `${Date.now()}-${index}`, 
        selected: true 
      }))
    };
  } catch (error) {
    console.error("Error al generar plan CIA:", error);
    throw new Error("Error en la arquitectura de IA al procesar la taxonomía COSO.");
  }
};