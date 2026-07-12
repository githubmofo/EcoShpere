// lib/api-client.ts
// Fetch helper with transparent local-storage failover for robust hackathon/demo execution
"use client";

import {
  initialEmissionFactors,
  initialCarbonTransactions,
  initialEnvironmentalGoals,
  initialDepartmentScores,
  initialEmissionsTrend,
  initialRecentActivities
} from "./mock-data";

import { calculateOverallScore } from "./scoring";

const API_BASE_URL =
<<<<<<< HEAD
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
    : "http://localhost:5000/api";

// Local storage helper keys
const STORAGE_KEYS = {
  EMISSION_FACTORS: "ecosphere_emission_factors",
  CARBON_TRANSACTIONS: "ecosphere_carbon_transactions",
  ENVIRONMENTAL_GOALS: "ecosphere_environmental_goals",
  DEPARTMENT_SCORES: "ecosphere_department_scores",
  RECENT_ACTIVITIES: "ecosphere_recent_activities",
  ESG_CONFIG: "ecosphere_esg_config"
};

// Initialize LocalStorage with mock data on the client side
function getLocalStorageData<T>(key: string, initialData: T): T {
  if (typeof window === "undefined") return initialData;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      window.localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error("Local storage error:", e);
    return initialData;
  }
}

function setLocalStorageData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// Mock handlers to intercept endpoints
function handleMockRequest(endpoint: string, method: string, body?: any): any {
  console.log(`[MOCK API Interceptor] ${method} ${endpoint}`, body);

  if (endpoint.startsWith("/dashboard/summary")) {
    const scores = getLocalStorageData(STORAGE_KEYS.DEPARTMENT_SCORES, initialDepartmentScores);
    const config = getLocalStorageData(STORAGE_KEYS.ESG_CONFIG, {
      auto_emission_enabled: true,
      weights: { environmental: 0.4, social: 0.3, governance: 0.3 }
    });
    
    // Average scores
    const env = scores.reduce((sum, s) => sum + s.environmental, 0) / scores.length;
    const soc = scores.reduce((sum, s) => sum + s.social, 0) / scores.length;
    const gov = scores.reduce((sum, s) => sum + s.governance, 0) / scores.length;
    const overall = calculateOverallScore(env, soc, gov, config.weights);

    return {
      environmentalScore: Math.round(env),
      socialScore: Math.round(soc),
      governanceScore: Math.round(gov),
      overallScore: Math.round(overall),
      departmentScores: scores
    };
  }

  if (endpoint.startsWith("/dashboard/emissions-trend")) {
    return initialEmissionsTrend;
  }

  if (endpoint.startsWith("/dashboard/recent-activity")) {
    return getLocalStorageData(STORAGE_KEYS.RECENT_ACTIVITIES, initialRecentActivities);
  }

  if (endpoint.startsWith("/environmental/summary")) {
    const txs = getLocalStorageData(STORAGE_KEYS.CARBON_TRANSACTIONS, initialCarbonTransactions);
    const goals = getLocalStorageData(STORAGE_KEYS.ENVIRONMENTAL_GOALS, initialEnvironmentalGoals);
    
    const totalEmissions = txs.reduce((sum, tx) => sum + tx.emissionsValue, 0);
    const activeGoals = goals.filter(g => g.status === "on-track" || g.status === "at-risk").length;
    
    const achievementSum = goals.reduce((sum, g) => {
      const progress = g.targetEmissions > 0 
        ? Math.min((g.currentEmissions / g.targetEmissions) * 100, 100) 
        : 100;
      return sum + progress;
    }, 0);
    const avgAchievement = goals.length > 0 ? Math.round(achievementSum / goals.length) : 0;

    return {
      totalEmissions,
      activeGoals,
      avgAchievement,
      period: "Current Quarter"
    };
  }

  if (endpoint.startsWith("/environmental/emission-factors")) {
    const list = getLocalStorageData<any[]>(STORAGE_KEYS.EMISSION_FACTORS, initialEmissionFactors);
    const match = endpoint.match(/\/environmental\/emission-factors\/([^\/]+)/);
    
    if (method === "GET") {
      return list;
    }
    if (method === "POST" && body) {
      const newFactor = {
        ...body,
        id: `ef-${Date.now()}`,
        updatedAt: new Date().toISOString().split("T")[0]
      };
      const updated = [...list, newFactor];
      setLocalStorageData(STORAGE_KEYS.EMISSION_FACTORS, updated);
      return newFactor;
    }
    if (method === "PATCH" && match && body) {
      const id = match[1];
      const updated = list.map(item => item.id === id ? { ...item, ...body } : item);
      setLocalStorageData(STORAGE_KEYS.EMISSION_FACTORS, updated);
      return updated.find(item => item.id === id);
    }
  }

  if (endpoint.startsWith("/environmental/carbon-transactions")) {
    const list = getLocalStorageData<any[]>(STORAGE_KEYS.CARBON_TRANSACTIONS, initialCarbonTransactions);
    if (method === "GET") {
      return list;
    }
    if (method === "POST" && body) {
      const newTx = {
        ...body,
        id: `tx-${Date.now()}`,
        emissionsValue: Number(body.emissionsValue) || 0,
        quantity: Number(body.quantity) || 0
      };
      const updated = [...list, newTx];
      setLocalStorageData(STORAGE_KEYS.CARBON_TRANSACTIONS, updated);

      // Also log recent activity
      const activities = getLocalStorageData<any[]>(STORAGE_KEYS.RECENT_ACTIVITIES, initialRecentActivities);
      const newActivity = {
        id: `act-${Date.now()}`,
        type: "carbon",
        title: "Carbon Log Entry",
        description: `${body.department} logged ${body.quantity} unit ${body.sourceType} transaction.`,
        timestamp: "Just now",
        user: "Ansh Nayak"
      };
      setLocalStorageData(STORAGE_KEYS.RECENT_ACTIVITIES, [newActivity, ...activities]);

      // Update current emissions in matching goal
      const goals = getLocalStorageData<any[]>(STORAGE_KEYS.ENVIRONMENTAL_GOALS, initialEnvironmentalGoals);
      const goalUpdated = goals.map(g => {
        if (g.department.toLowerCase() === body.department.toLowerCase()) {
          const nextEmissions = g.currentEmissions + newTx.emissionsValue;
          return {
            ...g,
            currentEmissions: nextEmissions,
            status: nextEmissions > g.targetEmissions ? "behind" : nextEmissions > g.targetEmissions * 0.85 ? "at-risk" : "on-track"
          };
        }
        return g;
      });
      setLocalStorageData(STORAGE_KEYS.ENVIRONMENTAL_GOALS, goalUpdated);

      return newTx;
    }
  }

  if (endpoint.startsWith("/environmental/goals")) {
    const list = getLocalStorageData<any[]>(STORAGE_KEYS.ENVIRONMENTAL_GOALS, initialEnvironmentalGoals);
    const match = endpoint.match(/\/environmental\/goals\/([^\/]+)/);

    if (method === "GET") {
      return list;
    }
    if (method === "POST" && body) {
      const newGoal = {
        ...body,
        id: `g-${Date.now()}`,
        targetEmissions: Number(body.targetEmissions) || 0,
        currentEmissions: Number(body.currentEmissions) || 0,
        status: body.status || "on-track"
      };
      const updated = [...list, newGoal];
      setLocalStorageData(STORAGE_KEYS.ENVIRONMENTAL_GOALS, updated);
      return newGoal;
    }
    if (method === "PATCH" && match && body) {
      const id = match[1];
      const updated = list.map(item => item.id === id ? { ...item, ...body } : item);
      setLocalStorageData(STORAGE_KEYS.ENVIRONMENTAL_GOALS, updated);
      return updated.find(item => item.id === id);
    }
  }

  if (endpoint.startsWith("/settings/esg-config")) {
    if (method === "GET") {
      return getLocalStorageData(STORAGE_KEYS.ESG_CONFIG, {
        auto_emission_enabled: true,
        weights: { environmental: 0.4, social: 0.3, governance: 0.3 }
      });
    }
  }

  return { message: "Mock endpoint not custom handled" };
}

// Check if client backend is active, else failover to mock
async function makeRequest<T>(endpoint: string, method: string, body?: unknown): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    // Transparent failover to mock data logic
    return handleMockRequest(endpoint, method, body) as T;
  }
}
=======
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
>>>>>>> origin/feature/member2-social-governance

export async function apiGet<T>(endpoint: string): Promise<T> {
  return makeRequest<T>(endpoint, "GET");
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  return makeRequest<T>(endpoint, "POST", body);
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  return makeRequest<T>(endpoint, "PUT", body);
}

export async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  return makeRequest<T>(endpoint, "PATCH", body);
}

export async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return makeRequest<T>(endpoint, "DELETE");
}
