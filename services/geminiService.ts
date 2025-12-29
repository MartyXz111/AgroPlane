
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_RULES = `Ești consultantul AI al aplicației AgroPlan pentru fermieri români.
REGULI STRICTE:
1. Nu folosi ghilimele, bold, italic sau orice alte caractere speciale precum stelute sau semne de citare.
2. Nu scrie texte lungi. Răspunsurile trebuie să fie scurte, maxim 3 rânduri sau 3 puncte.
3. Nu te prezenta niciodată. Treci direct la subiect.
4. Limbaj simplu, prietenos și clar.
5. Fără informații inutile sau explicații lungi.
6. Nu folosi formatare Markdown de tipul bold sau italic.`;

export const getAgriculturalAdvice = async (prompt: string, history: { role: string, content: string }[] = []) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_RULES,
      },
    });

    const response = await chat.sendMessage({ message: prompt });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Eroare la procesare. Incearca din nou.";
  }
};

export const getSmartRecommendations = async (location: string, soil: string, month: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_RULES,
      },
      contents: `Sunt in ${location}, sol ${soil}, luna ${month}. Recomanda 3 culturi si 2 sfaturi rapide de ingrijire.`,
    });
    return response.text;
  } catch (error) {
    console.error("Recommendation Error:", error);
    return "Nu am putut genera recomandari.";
  }
};

export const generateCropSchedule = async (cropName: string, variety: string, plantedDate: string, soil: string, ph?: number, texture?: string) => {
  try {
    const soilInfo = `sol ${soil}${ph ? `, pH: ${ph}` : ''}${texture ? `, textura: ${texture}` : ''}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              daysAfterPlanting: { type: Type.INTEGER },
              category: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["title", "daysAfterPlanting", "category"]
          }
        }
      },
      contents: `Plan de sarcini pentru ${cropName} ${variety} in ${soilInfo} din data ${plantedDate}. Note scurte si simple.`,
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Schedule Generation Error:", error);
    return [];
  }
};

export const analyzePlantImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_RULES,
      },
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Identifica planta si spune starea de sanatate in maxim 2 randuri." }
        ]
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Imaginea nu a putut fi analizata.";
  }
};
