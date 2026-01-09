import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Universe = v2.Universe;
type Moment = v2.Moment;
type Challenge = v2.Challenge;

const API_BASE = "/api";

/**
 * API response types
 */
export interface GameResponse {
  state: GameState;
  universe: Universe;
}

export interface CreateGameResponse {
  gameId: string;
  state: GameState;
}

export interface MomentActionResponse {
  state: GameState;
  aiConditions?: Array<{ hint: string; expression: string }>;
  executedExpressions?: string[];
}

export interface CreateMomentResponse extends MomentActionResponse {
  momentInstanceId: string;
}

export interface ChallengeLogEntry {
  round: number;
  message: string;
  type: "action" | "roll" | "effect" | "outcome";
  data?: Record<string, unknown>;
}

export interface ChallengeRuntimeState {
  challengeId: string;
  momentId: string;
  round: number;
  maxRounds: number;
  roleAssignments: Record<string, string>;
  roundLog: ChallengeLogEntry[];
  variables: Record<string, number>;
  completed: boolean;
  outcome: { id: string; name: string } | null;
}

export interface ChallengeResponse {
  state: GameState;
  challengeState: ChallengeRuntimeState;
  aiConditions?: Array<{ hint: string; expression: string }>;
  logEntries: ChallengeLogEntry[];
}

export interface ChallengeStateResponse {
  challengeState: ChallengeRuntimeState | null;
  challengeDefinition: Challenge | null;
}

/**
 * API Client for game-api-v2
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Universe endpoints
  async getUniverses(): Promise<Array<{ id: string; name: string; description: string; theme: string }>> {
    return this.request("/universes");
  }

  async getUniverse(id: string): Promise<Universe> {
    return this.request(`/universe/${id}`);
  }

  async registerUniverse(universe: Universe): Promise<{ success: boolean; universeId: string }> {
    return this.request("/universe", {
      method: "POST",
      body: JSON.stringify(universe),
    });
  }

  // Game session endpoints
  async createGame(universeId: string, characterId?: string): Promise<CreateGameResponse> {
    return this.request("/game/create", {
      method: "POST",
      body: JSON.stringify({ universeId, characterId }),
    });
  }

  async getGame(gameId: string): Promise<GameResponse> {
    return this.request(`/game/${gameId}`);
  }

  async saveGame(gameId: string): Promise<{ success: boolean; savedAt: number }> {
    return this.request(`/game/${gameId}/save`, {
      method: "PUT",
    });
  }

  async deleteGame(gameId: string): Promise<{ success: boolean }> {
    return this.request(`/game/${gameId}`, {
      method: "DELETE",
    });
  }

  async listGames(): Promise<Array<{ id: string; universeId: string; createdAt: number; savedAt: number }>> {
    return this.request("/games");
  }

  // Moment endpoints
  async selectMoment(gameId: string, momentInstanceId: string): Promise<MomentActionResponse> {
    return this.request(`/game/${gameId}/moment/select`, {
      method: "POST",
      body: JSON.stringify({ momentInstanceId }),
    });
  }

  async completeMoment(gameId: string): Promise<MomentActionResponse> {
    return this.request(`/game/${gameId}/moment/complete`, {
      method: "POST",
    });
  }

  async createMoment(
    gameId: string,
    templateId: string,
    initialStatus?: Moment["status"]
  ): Promise<CreateMomentResponse> {
    return this.request(`/game/${gameId}/moment/create`, {
      method: "POST",
      body: JSON.stringify({ templateId, initialStatus }),
    });
  }

  async getAvailableMoments(gameId: string): Promise<Moment[]> {
    return this.request(`/game/${gameId}/moments/available`);
  }

  async getActiveMoment(gameId: string): Promise<Moment | null> {
    return this.request(`/game/${gameId}/moments/active`);
  }

  async getMomentHistory(gameId: string): Promise<Moment[]> {
    return this.request(`/game/${gameId}/moments/history`);
  }

  async runTransitions(gameId: string): Promise<MomentActionResponse> {
    return this.request(`/game/${gameId}/transitions/run`, {
      method: "POST",
    });
  }

  // Challenge endpoints
  async startChallenge(
    gameId: string,
    roleAssignments: Record<string, string>
  ): Promise<ChallengeResponse> {
    return this.request(`/game/${gameId}/challenge/start`, {
      method: "POST",
      body: JSON.stringify({ roleAssignments }),
    });
  }

  async advanceChallenge(gameId: string): Promise<ChallengeResponse> {
    return this.request(`/game/${gameId}/challenge/advance`, {
      method: "POST",
    });
  }

  async getChallengeState(gameId: string): Promise<ChallengeStateResponse> {
    return this.request(`/game/${gameId}/challenge`);
  }

  async endChallenge(gameId: string): Promise<{ success: boolean }> {
    return this.request(`/game/${gameId}/challenge/end`, {
      method: "POST",
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request("/health");
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
