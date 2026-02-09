
export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
}

export interface StoreResult {
  store_name: string;
  distance: string;
  price_level: string; // e.g. "$", "$$", "$$$"
  address: string;
  live_status: string;
  why_here: string;
  map_link: string;
}

export interface InventoryResponse {
  raw_text: string;
  grounding_chunks: GroundingChunk[];
}

export interface UserLocation {
  lat: number;
  lng: number;
}
