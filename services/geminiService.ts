import { GoogleGenAI, Type } from "@google/genai";
import { NutritionData, DailyReportData, ScanHistoryItem, GoalGuideData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const NUTRITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fat: { type: Type.NUMBER },
    healthScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
    cons: { type: Type.ARRAY, items: { type: Type.STRING } },
    effectOnBody: { type: Type.STRING, description: "Detailed explanation of what happens physiologically (e.g., insulin spike, muscle repair) when eaten." },
    consumptionAdvice: { type: Type.STRING, description: "Specific advice on when to eat (e.g. post-workout) and how often (e.g. once a week)." }
  },
  required: ["productName", "calories", "protein", "carbs", "fat", "healthScore", "summary", "pros", "cons", "effectOnBody", "consumptionAdvice"]
};

export const analyzeImage = async (base64Image: string, userGoal: string): Promise<NutritionData> => {
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          {
            text: `Analyze this image to identify the EXACT food product.
            
            **USER GOAL:** "${userGoal}"
            
            **CRITICAL IDENTIFICATION STEPS:**
            1. **Barcode/Text**: Read barcode or packaging text to find the Brand and Specific Product Name.
            
            **ANALYSIS INSTRUCTIONS:**
            - **Health Score**: Score from 1-10 based STRICTLY on how well it aligns with the goal: "${userGoal}". (e.g., High calorie is GOOD for "Weight Gain" but BAD for "Weight Loss").
            - **Pros/Cons**: List pros and cons specifically for someone wanting to achieve "${userGoal}".
            - **Physiological Analysis**: Explain elaborateley what happens to the body.
            - **Consumption Advice**: Be specific. (e.g. "Avoid if cutting" or "Good for bulking").
            
            Return the data in the specified JSON structure.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: NUTRITION_SCHEMA
      }
    });

    if (response.text) return JSON.parse(response.text) as NutritionData;
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw new Error("Failed to analyze image.");
  }
};

export const analyzeText = async (productName: string, userGoal: string): Promise<NutritionData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{
          text: `Analyze the food product: "${productName}".
          
          **USER GOAL:** "${userGoal}"

          Provide a standard nutritional estimation per serving.
          
          **ANALYSIS INSTRUCTIONS:**
          - **Health Score**: Score from 1-10 based STRICTLY on how well it aligns with the goal: "${userGoal}".
          - **Pros/Cons**: List pros and cons specifically for "${userGoal}".
          - **Physiological Analysis**: Explain elaborateley what happens to the body.
          - **Consumption Advice**: When and how often to consume based on the goal.
          
          Return the data in the specified JSON structure.`
        }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: NUTRITION_SCHEMA
      }
    });

    if (response.text) return JSON.parse(response.text) as NutritionData;
    throw new Error("No response from Gemini");
  } catch (error) {
    console.error("Gemini Text Analysis Error:", error);
    throw new Error("Failed to find product info.");
  }
};

export const generateDailyReport = async (history: ScanHistoryItem[]): Promise<DailyReportData> => {
  const foodList = history.map(h => `${h.productName} (${h.calories}kcal)`).join(", ");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{
          text: `Here is a list of foods consumed today: [${foodList}].
          
          Generate a "End of Day" report.
          1. Estimate Total Calories.
          2. Assess the overall Macro Balance (High Carb / High Fat / Balanced).
          3. Give a Health Score (1-10) for the day.
          4. Provide a detailed analysis of the day's diet quality.
          5. Give 3 actionable recommendations for tomorrow.`
        }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalCalories: { type: Type.NUMBER },
            macroBalance: { type: Type.STRING },
            score: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as DailyReportData;
    throw new Error("No report generated");
  } catch (error) {
    console.error("Gemini Report Error:", error);
    throw new Error("Failed to generate daily report.");
  }
};

export const generateGoalGuide = async (userGoal: string): Promise<GoalGuideData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{
          text: `Create a comprehensive daily guide for someone with the goal: "${userGoal}".
          
          Provide:
          1. A motivating summary.
          2. 4-5 Specific guidelines (Do's, Don'ts, Tips).
          3. A typical daily schedule (Morning to Night) optimized for this goal.
          
          Return JSON.`
        }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goalName: { type: Type.STRING },
            summary: { type: Type.STRING },
            guidelines: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                   title: { type: Type.STRING },
                   description: { type: Type.STRING },
                   type: { type: Type.STRING, enum: ['do', 'dont', 'tip'] }
                }
              } 
            },
            schedule: { 
              type: Type.ARRAY, 
              items: { 
                 type: Type.OBJECT,
                 properties: {
                    time: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    description: { type: Type.STRING }
                 }
              } 
            }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as GoalGuideData;
    throw new Error("No guide generated");
  } catch (error) {
    console.error("Gemini Guide Error:", error);
    throw new Error("Failed to generate goal guide.");
  }
};
