
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_PROMPT, KLARITERM_SYSTEM_PROMPT, KLARIPLAIN_SYSTEM_PROMPT } from "../constants";
import { FullAnalysisResponse, KlaritermResponse, KlariPlainResponse, ModelMode, AnalysisPipeline } from "../types";

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not set in the environment.");
    return "";
  }
  return apiKey;
};

const CORE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    statement_analysis: {
      type: Type.OBJECT,
      properties: {
        original_text: { type: Type.STRING },
        highlighted_text: { type: Type.STRING },
        debate_reason: { type: Type.STRING },
        risk_profile: {
          type: Type.OBJECT,
          properties: {
            tier_1_count: { type: Type.NUMBER },
            tier_2_count: { type: Type.NUMBER },
            tier_3_count: { type: Type.NUMBER },
            unverifiable_claim_count: { type: Type.NUMBER },
            worst_lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  flaw: { type: Type.STRING }
                },
                required: ["text", "flaw"]
              }
            }
          },
          required: ["tier_1_count", "tier_2_count", "tier_3_count", "unverifiable_claim_count", "worst_lines"]
        },
        rhetoric_density: {
          type: Type.OBJECT,
          properties: {
            binding_count: { type: Type.NUMBER },
            rhetorical_count: { type: Type.NUMBER },
            rhetorical_percentage: { type: Type.NUMBER }
          },
          required: ["binding_count", "rhetorical_count", "rhetorical_percentage"]
        },
        verification_requirements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              requirement: { type: Type.STRING },
              gap: { type: Type.STRING }
            },
            required: ["requirement", "gap"]
          }
        },
        assumptions_to_avoid: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              assumption: { type: Type.STRING },
              flaw: { type: Type.STRING },
              reality: { type: Type.STRING }
            },
            required: ["assumption", "flaw", "reality"]
          }
        },
        elements: {
          type: Type.OBJECT,
          properties: {
            who: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["CLEAR", "BROAD", "MISSING"] },
                reasoning: { type: Type.STRING }
              },
              required: ["content", "status", "reasoning"]
            },
            action: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["CLEAR", "BROAD", "MISSING"] },
                reasoning: { type: Type.STRING }
              },
              required: ["content", "status", "reasoning"]
            },
            object: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["CLEAR", "BROAD", "MISSING"] },
                reasoning: { type: Type.STRING }
              },
              required: ["content", "status", "reasoning"]
            },
            measure: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["CLEAR", "BROAD", "MISSING"] },
                reasoning: { type: Type.STRING }
              },
              required: ["content", "status", "reasoning"]
            },
            when: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["CLEAR", "BROAD", "MISSING"] },
                reasoning: { type: Type.STRING }
              },
              required: ["content", "status", "reasoning"]
            },
            premise: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["CLEAR", "BROAD", "MISSING"] },
                reasoning: { type: Type.STRING }
              },
              required: ["content", "status", "reasoning"]
            }
          },
          required: ["who", "action", "object", "measure", "when", "premise"]
        }
      },
      required: ["original_text", "highlighted_text", "debate_reason", "risk_profile", "rhetoric_density", "assumptions_to_avoid", "verification_requirements", "elements"]
    },
    literal_translation: { type: Type.STRING }
  },
  required: ["statement_analysis", "literal_translation"]
};

const DECODER_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overview: { type: Type.STRING },
    metrics: {
      type: Type.OBJECT,
      properties: {
        hicr: { type: Type.NUMBER },
        isi: { type: Type.NUMBER },
        exposure_domains: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["hicr", "isi", "exposure_domains"]
    },
    attention_clauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          excerpt: { type: Type.STRING },
          description: { type: Type.STRING },
          scores: {
            type: Type.OBJECT,
            properties: {
              asymmetry: { type: Type.NUMBER },
              unilateral: { type: Type.NUMBER },
              rights: { type: Type.NUMBER },
              scope: { type: Type.NUMBER },
              latent: { type: Type.NUMBER },
              total_cis: { type: Type.NUMBER }
            },
            required: ["asymmetry", "unilateral", "rights", "scope", "latent", "total_cis"]
          },
          impact_classification: { type: Type.STRING, enum: ["Low", "Moderate", "High"] }
        },
        required: ["excerpt", "description", "scores", "impact_classification"]
      }
    },
    structural_exposure: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["overview", "metrics", "attention_clauses", "structural_exposure"]
};

const PLAIN_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    commitments: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    explicitly_stated: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    not_specified: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["commitments", "explicitly_stated", "not_specified"]
};

export const fetchUrlContent = async (url: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract text for logic check from: ${url}`,
      config: { tools: [{ googleSearch: {} }] },
    });
    if (!response.text) throw new Error("Could not retrieve text.");
    return response.text;
  } catch (error: any) {
    throw new Error("Permission denied or URL fetch failed.");
  }
};

export const analyzeStatement = async (
  text: string, 
  fileData?: { mimeType: string; data: string },
  modelMode: ModelMode = 'reasoning',
  pipeline: AnalysisPipeline = 'lens'
): Promise<FullAnalysisResponse | KlaritermResponse | KlariPlainResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  let systemPrompt: string;
  let schema: Schema;

  switch (pipeline) {
    case 'term':
      systemPrompt = KLARITERM_SYSTEM_PROMPT;
      schema = DECODER_SCHEMA;
      break;
    case 'plain':
      systemPrompt = KLARIPLAIN_SYSTEM_PROMPT;
      schema = PLAIN_SCHEMA;
      break;
    case 'lens':
    default:
      systemPrompt = SYSTEM_PROMPT;
      schema = CORE_SCHEMA;
      break;
  }

  let contents: any = fileData ? { parts: [{ inlineData: fileData }, { text: text || "Analyze document." }] } : text;

  const generateWithModel = async (model: string, budget: number) => {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingBudget: budget },
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    if (!response.text) throw new Error(`Empty response from ${model}`);
    return JSON.parse(response.text);
  };

  try {
    const model = modelMode === 'quick' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
    const budget = modelMode === 'quick' ? 4096 : 32768;
    try {
      return await generateWithModel(model, budget);
    } catch (e: any) {
      if (model === 'gemini-3-pro-preview') {
        console.warn("Pro failed, falling back to Flash.");
        return await generateWithModel('gemini-3-flash-preview', 8192);
      }
      throw e;
    }
  } catch (error: any) {
    throw new Error(error.message || "Analysis failed.");
  }
};

export const streamChat = async function* (history: any[], newMessage: string) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { 
      systemInstruction: SYSTEM_PROMPT,
      thinkingConfig: { thinkingBudget: 4096 }
    },
    history: history
  });
  const result = await chat.sendMessageStream({ message: newMessage });
  for await (const chunk of result) {
    yield chunk.text;
  }
};
