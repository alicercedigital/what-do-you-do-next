// ============================================
// API Request/Response Types
// ============================================

// Smart Input API
export interface AIContext {
  universeName?: string
  setting?: string
  statName?: string
  itemName?: string
  challengeName?: string
}

export interface SmartInputRequest {
  action: "generate" | "expand" | "improve" | "summarize" | "suggest-names"
  value?: string
  fieldType: string
  context?: AIContext
}

export interface SmartInputResponse {
  result: string
}

// Attributes Generate API
export interface GenerateAttributeRequest {
  attributeName: string
  genreSetting: string
}

export interface GenerateAttributeResponse {
  attribute: {
    id: string
    name: string
    short?: string
    description: string
    type: "core" | "computed"
    display: {
      icon: string
      color: string
      style: "number" | "bar"
      barColor?: string
      showInCreator?: boolean
      showInSheet?: boolean
      order?: number
    }
    range?: {
      min: number
      max: number
    }
  }
}

// Attributes Benchmarks API
export interface GenerateBenchmarksRequest {
  attributeName: string
  attributeSummary: string
  genreSetting: string
}

export interface Benchmark {
  value: number
  label: string
  description: string
}

export interface GenerateBenchmarksResponse {
  benchmarks: Benchmark[]
}

// Story Generate API
export interface StoryGenerateRequest {
  currentHeroStep?: string
  nodeCount?: number
}

export interface StoryGenerateResponse {
  events: import("./types").Card[]
}
