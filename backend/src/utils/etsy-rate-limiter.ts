import Bottleneck from 'bottleneck';
import axios, { AxiosRequestConfig } from 'axios';

/**
 * Etsy API v3 Rate Limiting Service
 * 
 * Limits:
 * - 10 requests/second per App
 * - Burst ~20 requests
 * 
 * Too many requests = IP block!
 * 
 * This service ensures we never exceed the rate limit.
 */

// Create rate limiter: ~8 req/sec to stay safe
const etsyLimiter = new Bottleneck({
    minTime: 125,        // 125ms between requests = 8 req/sec (safe margin)
    maxConcurrent: 2,    // Max 2 concurrent requests
    reservoir: 20,       // Burst allowance
    reservoirRefreshAmount: 20,
    reservoirRefreshInterval: 2000  // Refill burst every 2 seconds
});

// Log rate limit events
etsyLimiter.on('failed', async (error, jobInfo) => {
    console.error('🚨 Etsy API Rate Limit Issue:', error.message);
    if (jobInfo.retryCount < 3) {
        console.log(`⏳ Retrying in ${2000}ms... (Attempt ${jobInfo.retryCount + 1})`);
        return 2000; // Retry after 2 seconds
    }
});

etsyLimiter.on('depleted', () => {
    console.warn('⚠️  Rate limit reservoir depleted, slowing down...');
});

/**
 * Make a rate-limited GET request to Etsy API
 */
export async function rateLimitedGet(url: string, config?: AxiosRequestConfig) {
    return etsyLimiter.schedule(() => axios.get(url, config));
}

/**
 * Make a rate-limited POST request to Etsy API
 */
export async function rateLimitedPost(url: string, data?: any, config?: AxiosRequestConfig) {
    return etsyLimiter.schedule(() => axios.post(url, data, config));
}

/**
 * Make a rate-limited PUT request to Etsy API
 */
export async function rateLimitedPut(url: string, data?: any, config?: AxiosRequestConfig) {
    return etsyLimiter.schedule(() => axios.put(url, data, config));
}

/**
 * Make a rate-limited DELETE request to Etsy API
 */
export async function rateLimitedDelete(url: string, config?: AxiosRequestConfig) {
    return etsyLimiter.schedule(() => axios.delete(url, config));
}

/**
 * Get current rate limiter status (for monitoring)
 */
export function getRateLimitStatus() {
    return {
        running: etsyLimiter.running(),
        queued: etsyLimiter.queued()
    };
}
