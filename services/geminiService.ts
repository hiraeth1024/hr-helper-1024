import { GoogleGenAI, Type } from "@google/genai";
import { Group } from "../types";

// Using the provided environment variable directly as per instructions
const apiKey = process.env.API_KEY || ''; 

// We handle the possibility of missing key gracefully in the UI logic, 
// but here we initialize if possible.
const ai = new GoogleGenAI({ apiKey });

export const generateCreativeTeamNames = async (groups: Group[]): Promise<Group[]> => {
  if (!apiKey) {
    console.warn("API Key not found. Skipping AI generation.");
    return groups;
  }

  // Prepare the data for the prompt
  const groupData = groups.map(g => ({
    id: g.id,
    members: g.members.map(m => m.name)
  }));

  const prompt = `
    I have divided people into the following groups. 
    Please generate a creative, fun, and professional team name for each group based on the vibe of their names or just random corporate-safe creativity (e.g., "The Innovators", "Code Crusaders", "Synergy Squad").
    
    Groups:
    ${JSON.stringify(groupData)}

    Return the result as a JSON array of objects, where each object has 'id' (matching the group id) and 'name' (the new team name).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING }
            },
            required: ["id", "name"]
          }
        }
      }
    });

    let rawText = response.text;
    if (!rawText) return groups;

    // Robustness: Strip markdown code blocks if the model includes them despite responseMimeType
    rawText = rawText.trim();
    if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }

    const result = JSON.parse(rawText) as { id: string, name: string }[];

    // Merge the new names back into the groups
    return groups.map(g => {
      const match = result.find(r => r.id === g.id);
      return match ? { ...g, name: match.name } : g;
    });

  } catch (error) {
    console.error("Failed to generate team names:", error);
    return groups;
  }
};