
import { GoogleGenAI } from "@google/genai";
import { InventoryResponse } from "./types";

const SYSTEM_INSTRUCTION = `
ROLE: You are the "Local Live Price Indexer." Your primary job is to find and display the exact retail price for specific products in stores near the user.

CORE INSTRUCTIONS:
1. EXACT PRICE PRIORITY: Whenever a user searches for a product, you must use Grounding to look for "Local Inventory" metadata.
   - If an exact retail price is found (e.g., "$5.49"), prioritize it and display it prominently.
   - If an exact price isn't listed, find the store's "Price Level" ($ to $$$) AND the store's official website or phone number so the user can check the exact price instantly.
2. LOCAL STOCK TRACKING: Cross-reference the product with local store types (e.g., search "Pharmacies" for "NMF Lip balm" within a 5km radius).
3. RANKING BY PRICE: You MUST sort the results from "Lowest Price" to "Highest Price." Label the cheapest one as "BEST LOCAL DEAL."
4. NO-FAILURE RULE: If a specific brand price is hidden, provide the price of the closest equivalent product at that store to give the user a baseline (e.g., "NMF not listed, but similar lip balms start at $4.00 here").

OUTPUT FORMAT:
Provide the response in clear Markdown. For each result, include:
- **[Store Name]**
- **EXACT PRICE:** $[Amount] (or "Equivalent starting at $[Amount]")
- **Distance:** [Number] km
- **Status:** [Open/Closed] | [Stock Level: In Stock/Low Stock]
- [Google Maps URL]

Always start with a brief summary: "I indexed [X] stores. The best local deal for [Product] is $[Price] at [Store]."
`;

export class InventoryEngine {
  async searchProduct(query: string, location?: { lat: number; lng: number }): Promise<InventoryResponse | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: `Search for the live retail price and availability of "${query}" near me. Rank results by lowest price.` }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: location ? {
                latitude: location.lat,
                longitude: location.lng
              } : undefined
            }
          }
        },
      });

      return {
        raw_text: response.text || "No results found.",
        grounding_chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error: any) {
      console.error("Price Indexer Error:", error);
      throw error;
    }
  }
}
