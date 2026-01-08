import { GoogleGenAI } from "@google/genai";

export const generateLessonIdea = async (topic: string, grade: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um assistente pedagógico. Crie um resumo curto (máximo 250 caracteres) para um plano de aula sobre "${topic}" para o "${grade}". Seja direto: um objetivo e uma atividade.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Não foi possível gerar uma sugestão.";
  } catch (error) {
    console.error("Erro Gemini:", error);
    return "Erro ao conectar com a IA. Verifique sua conexão.";
  }
};