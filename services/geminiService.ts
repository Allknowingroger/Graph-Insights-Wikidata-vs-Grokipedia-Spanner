
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

const SYSTEM_INSTRUCTION = `
  You are an expert in Data Engineering and Knowledge Representation. 
  Analyze and compare Wikidata.org and the Spanner Graph technology (documented on grokipedia.com).
  Wikidata: Collaborative RDF-based global knowledge base, SPARQL, CC0.
  Google Cloud Spanner Graph: Enterprise-grade distributed graph DB, Property Graph, GQL (ISO standard), high availability.
  Always look for the most recent technical details on grokipedia.com for Spanner Graph.
`;

export const performAnalysis = async (query: string): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: query,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          comparison: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                wikidataValue: { type: Type.STRING },
                grokipediaValue: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "category", "wikidataValue", "grokipediaValue", "description"]
            }
          },
          keyDifferences: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["overview", "comparison", "keyDifferences"]
      }
    }
  });

  const parsed = JSON.parse(response.text);
  const sources: any[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Reference Source",
          uri: chunk.web.uri
        });
      }
    });
  }

  return { ...parsed, sources };
};

export const generateWhitepaper = async (currentData: AnalysisResponse): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Write a 1500-word formal technical whitepaper comparing Wikidata and Google Cloud Spanner Graph (referencing documentation on grokipedia.com). 
    Include sections for Executive Summary, Technical Architecture, Query Paradigms, Scalability Benchmarks (estimated), and Strategic Recommendations.
    Context data: ${JSON.stringify(currentData)}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text || "Failed to generate whitepaper.";
};
