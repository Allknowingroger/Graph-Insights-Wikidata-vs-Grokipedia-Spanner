
export interface ComparisonData {
  title: string;
  category: string;
  wikidataValue: string;
  grokipediaValue: string;
  description: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResponse {
  comparison: ComparisonData[];
  overview: string;
  keyDifferences: string[];
  sources: GroundingSource[];
}

export interface GraphNode {
  id: string;
  group: number;
  label: string;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}
