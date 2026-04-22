import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SuggestedSupplier {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  reason: string;
}

export const getSupplierSuggestions = async (materialName: string, location: string): Promise<SuggestedSupplier[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 realistic but fictional construction material suppliers in ${location} for "${materialName}". 
      Provide their name, specialty, a placeholder phone number, a placeholder email, and a brief reason why they are a good choice.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              specialty: { type: Type.STRING },
              phone: { type: Type.STRING },
              email: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["name", "specialty", "phone", "email", "reason"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error getting supplier suggestions:", error);
    return [];
  }
};
