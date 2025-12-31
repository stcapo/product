/// <reference types="vite/client" />
import { TransactionRow } from '../types';
import { generateMockData } from './mockData';

// Backend API URL - configurable via environment variable
// In production (Docker/Nginx), use relative path to allow reverse proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

let cachedData: TransactionRow[] | null = null;
let useBackend = true;  // Flag to track if backend is available

/**
 * Check if the backend API is available
 */
async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)  // 3 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch transaction data from backend API or fallback to mock data
 */
export async function fetchTransactionData(): Promise<TransactionRow[]> {
  // If we have cached data, return it
  if (cachedData) {
    return cachedData;
  }

  // Try backend first
  if (useBackend) {
    try {
      const isHealthy = await checkBackendHealth();

      if (isHealthy) {
        const response = await fetch(`${API_BASE_URL}/api/transactions?limit=10000`);

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            cachedData = data;
            console.log(`[API] Loaded ${data.length} transactions from backend`);
            return cachedData!;
          }
        }
      }
    } catch (error) {

      console.warn('[API] Backend unavailable, falling back to mock data:', error);
      useBackend = false;  // Disable backend for future requests
    }
  }

  // Fallback to mock data
  console.log('[API] Using mock data');
  cachedData = generateMockData();
  return cachedData;
}

/**
 * Clear cached data to force refresh
 */
export function clearCache(): void {
  cachedData = null;
  useBackend = true;  // Re-enable backend check on next fetch
}

/**
 * Fetch real-time metrics from backend
 */
export async function fetchRealtimeMetrics(): Promise<{
  total_gmv: number;
  total_orders: number;
  last_updated: string | null;
  latest_transactions: TransactionRow[];
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/realtime/latest`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.warn('[API] Real-time metrics unavailable');
  }
  return null;
}

/**
 * Fetch KPI summary from backend
 */
export async function fetchMetricsSummary(startDate?: string, endDate?: string): Promise<{
  gmv: number;
  orderCount: number;
  uniqueBuyers: number;
  totalItemsSold: number;
  aov: number;
  ipv: number;
  repurchaseRate: number;
} | null> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/api/metrics/summary?${params}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.warn('[API] Metrics summary unavailable');
  }
  return null;
}

/**
 * Fetch category analytics from backend
 */
export async function fetchCategoryAnalytics(startDate?: string, endDate?: string): Promise<{
  category: string;
  gmv: number;
  orderCount: number;
  percentage: number;
}[] | null> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/api/analytics/categories?${params}`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.warn('[API] Category analytics unavailable');
  }
  return null;
}

/**
 * Fetch user segments from backend
 */
export async function fetchUserSegments(): Promise<{
  segment: string;
  count: number;
  percentage: number;
  gmv: number;
}[] | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/segments`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    console.warn('[API] User segments unavailable');
  }
  return null;
}

// Legacy API integration guide kept for reference:
// 
// The API now supports the following endpoints:
// - GET /api/transactions - Transaction data with filters
// - GET /api/metrics/summary - KPI summary
// - GET /api/metrics/trends - Time series trends
// - GET /api/analytics/categories - Category breakdown
// - GET /api/analytics/segments - User segmentation
// - GET /api/analytics/cohort - Cohort retention
// - GET /api/realtime/latest - Real-time metrics from Redis
// - GET /api/health - Health check
