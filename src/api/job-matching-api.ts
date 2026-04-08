// Removed mock auth import - using real auth service
import { AIJobMatchRequest } from "@/services/ai-job-matching.service";
import { apiClient } from "@/lib/api-client";

export interface AIMatchRequest {
    skills: string[];
    location_preference?: string;
    salary_expectation?: string;
}

export interface AIJobMatch {
    job_id: string;
    title: string;
    company: string;
    location: string;
    salary_range?: string;
    match_score?: number;
    similarity_score?: number;
    matched_skills?: string[] | null;
    missing_skills?: string[] | null;
    created_at: string;
    // New optimized fields
    hybrid_score?: number;
    skill_match_score?: number;
    application_status?: string;
    remote_friendly?: boolean;
    job_type?: string;
    experience_level?: string;
    // CRITICAL: Add missing fields for job display
    description?: string;
    skills_required?: string[];
    requirements?: string;
    benefits?: string[];
}

export interface JobMatchResponse {
    jobs: AIJobMatch[];
    total: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    // Performance metrics from optimized service
    performance?: {
        latency_ms: number;
        cache_hit: boolean;
    };
}

export class JobMatchService {
    
    private static baseUrl = '/api/jobs/ai-match';
    private static v2BaseUrl = '/api/v2';  // Optimized endpoints
    private static unifiedBaseUrl = '/unified';  // New unified endpoints (apiClient adds /api/v1 prefix)

    static async getAiJobMatches(request: AIMatchRequest): Promise<AIJobMatch[]> { 
       // const query = skills.map((s) => `skills=${encodeURIComponent(s)}`).join("&");
        const query = new URLSearchParams();
        request.skills.forEach((s) => query.append("skills", s));
        if (request.location_preference) query.append("location_preference", request.location_preference)
        if (request.salary_expectation) query.append("salary_expectation", request.salary_expectation)
      
      // Fetching without Bearer token
            {/*

            const response = await fetch(`${this.baseUrl}?${query}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch AI Job matches");
        }

        const data = await response.json();
        return data as JobMatchResponse;
        */}
        // Attach auth automatically
        const endpoint = `${this.baseUrl}?${query.toString()}`;
        return await apiClient.post<AIJobMatch[]>(endpoint);
      

    }

    static async getAiJobMatchesWrapped(req: AIMatchRequest) {
        const jobs = await this.getAiJobMatches(req);
        return {jobs, total: jobs.length, page: 1, limit: jobs.length};
    }

    static async getVectorJobRecommendations(page: number = 0, limit: number = 6, userId?: string): Promise<JobMatchResponse> {
        // If userId is provided, use unified match service
        if (userId) {
            try {
                const offset = page * limit;
                return await this.getUnifiedRecommendations(userId, limit, true, offset);
            } catch (error) {
                console.warn('Unified recommendations failed, falling back to vector service:', error);
            }
        }

        // Fallback to original vector service
        const query = new URLSearchParams();
        query.append("limit", limit.toString());
        query.append("offset", (page * limit).toString());
        query.append("use_optimized", "true");  // Use optimized service by default
        
        const endpoint = `/vector/jobs/recommendations?${query.toString()}`;
        const startTime = performance.now();
        const response = await apiClient.get<any[]>(endpoint);
        const latency = performance.now() - startTime;
        
        // Transform the response to match AIJobMatch interface
        const jobs: AIJobMatch[] = response.map((job: any) => ({
            job_id: job.job_id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary_range: job.salary_range,
            // Use hybrid score if available (from optimized), fallback to similarity_score
            match_score: job.hybrid_score || job.match_score || job.similarity_score,
            similarity_score: job.similarity_score || job.vector_similarity,
            hybrid_score: job.hybrid_score,
            skill_match_score: job.skill_match_score,
            matched_skills: job.matched_skills,
            missing_skills: job.missing_skills,
            application_status: job.application_status,
            remote_friendly: job.remote_friendly,
            job_type: job.job_type,
            experience_level: job.experience_level,
            created_at: job.created_at || new Date().toISOString(),
            // ADD MISSING FIELDS FOR JOB DISPLAY
            description: job.description,
            skills_required: job.skills_required,
            requirements: job.requirements,
            benefits: job.benefits
        }));
        
        // Log performance in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✨ Recommendations loaded in ${latency.toFixed(2)}ms (${jobs.length} jobs)`);
        }
        
        return {
            jobs,
            total: jobs.length,
            page,
            limit,
            hasMore: jobs.length === limit,
            performance: {
                latency_ms: latency,
                cache_hit: latency < 100  // Assume cache hit if very fast
            }
        };
    }
    
    /**
     * Get recommendations with advanced filtering (uses optimized v2 endpoint)
     * Provides better performance and more detailed scoring
     */
    static async getAdvancedRecommendations(
        limit: number = 50,
        offset: number = 0,
        filters?: {
            location?: string;
            job_type?: string;
            experience_level?: string;
            remote_only?: boolean;
        },
        includeScoreDetails: boolean = false
    ): Promise<JobMatchResponse> {
        try {
            const query = new URLSearchParams();
            query.append("limit", limit.toString());
            query.append("offset", offset.toString());
            query.append("include_feature_scores", includeScoreDetails.toString());
            
            // Add filters if provided
            if (filters?.location) query.append("location_filter", filters.location);
            if (filters?.job_type) query.append("job_type", filters.job_type);
            if (filters?.experience_level) query.append("experience_level", filters.experience_level);
            if (filters?.remote_only) query.append("remote_only", "true");
            
            const endpoint = `${this.v2BaseUrl}/recommendations?${query.toString()}`;
            const startTime = performance.now();
            const response = await apiClient.get<any>(endpoint);
            const latency = performance.now() - startTime;
            
            // Transform v2 response to match existing interface
            const jobs: AIJobMatch[] = response.recommendations.map((job: any) => ({
                job_id: job.job_id,
                title: job.title,
                company: job.company,
                location: job.location,
                salary_range: job.salary_range,
                match_score: job.hybrid_score,
                similarity_score: job.vector_similarity,
                hybrid_score: job.hybrid_score,
                skill_match_score: job.skill_match_score,
                matched_skills: job.matched_skills,
                missing_skills: job.missing_skills,
                application_status: job.application_status,
                remote_friendly: job.remote_friendly,
                job_type: job.job_type,
                experience_level: job.experience_level,
                created_at: job.created_at || new Date().toISOString()
            }));
            
            // Log performance metrics
            if (response.metrics && process.env.NODE_ENV === 'development') {
                console.log('📊 Advanced Recommendations Performance:', {
                    backend_latency: `${response.metrics.total_latency_ms}ms`,
                    frontend_latency: `${latency.toFixed(2)}ms`,
                    cache_hit: response.metrics.cache_hit,
                    candidates_retrieved: response.metrics.candidates_retrieved
                });
            }
            
            return {
                jobs,
                total: response.metrics?.recommendations_count || jobs.length,
                page: Math.floor(offset / limit),
                limit,
                hasMore: jobs.length === limit,
                performance: {
                    latency_ms: response.metrics?.total_latency_ms || latency,
                    cache_hit: response.metrics?.cache_hit || false
                }
            };
        } catch (error) {
            console.warn('Advanced recommendations failed, falling back to standard', error);
            // Fallback to standard recommendations
            return this.getVectorJobRecommendations(Math.floor(offset / limit), limit);
        }
    }
    
    /**
     * Get quick preview recommendations (cached, ultra-fast)
     * Perfect for dashboard widgets or initial load
     */
    static async getRecommendationPreview(limit: number = 10): Promise<AIJobMatch[]> {
        try {
            const query = new URLSearchParams();
            query.append("limit", limit.toString());
            
            const endpoint = `${this.v2BaseUrl}/recommendations/preview?${query.toString()}`;
            const response = await apiClient.get<any[]>(endpoint);
            
            return response.map((job: any) => ({
                job_id: job.job_id,
                title: job.title,
                company: job.company,
                location: job.location,
                salary_range: job.salary_range,
                match_score: job.hybrid_score,
                similarity_score: job.vector_similarity,
                hybrid_score: job.hybrid_score,
                skill_match_score: job.skill_match_score,
                matched_skills: job.matched_skills,
                application_status: job.application_status,
                created_at: new Date().toISOString()
            }));
        } catch (error) {
            console.warn('Preview failed, using standard recommendations', error);
            const fallback = await this.getVectorJobRecommendations(0, limit);
            return fallback.jobs;
        }
    }
    
    /**
     * Clear recommendation cache after profile updates
     */
    static async clearRecommendationCache(): Promise<boolean> {
        try {
            const endpoint = `${this.v2BaseUrl}/cache/clear`;
            await apiClient.post(endpoint, {});
            console.log('✅ Recommendation cache cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear cache:', error);
            return false;
        }
    }

    // ===== NEW UNIFIED SEARCH METHODS =====

    /**
     * Get job recommendations using the new unified match service
     * This is the primary method that should be used going forward
     * Optimized for batches of 6 jobs per scroll with unified vector search
     */
    static async getUnifiedRecommendations(
        userId: string,
        limit: number = 6,
        useImproved: boolean = true,
        offset: number = 0
    ): Promise<JobMatchResponse> {
        try {
            const query = new URLSearchParams();
            query.append("limit", limit.toString());
            query.append("offset", offset.toString());
            if (useImproved !== undefined) {
                query.append("use_improved", useImproved.toString());
            }

            const endpoint = `${this.unifiedBaseUrl}/recommendations/${userId}?${query.toString()}`;
            const startTime = performance.now();
            const response = await apiClient.get<any>(endpoint);
            const latency = performance.now() - startTime;

            // Transform unified response to match existing interface
            const jobs: AIJobMatch[] = response.recommendations.map((job: any) => ({
                job_id: job.job_id,
                title: job.title,
                company: job.company,
                location: job.location,
                salary_range: job.salary_range,
                // Convert percentage to decimal (0-100 -> 0-1) and round to integer percentage
                match_score: Math.round(job.total_score || 0),
                similarity_score: job.component_scores?.vector_similarity || (job.total_score || 0) / 100,
                hybrid_score: job.total_score || 0,
                skill_match_score: job.component_scores?.skill_match || (job.total_score || 0) / 100,
                matched_skills: job.matched_skills,
                missing_skills: job.missing_skills,
                application_status: job.application_status,
                remote_friendly: job.remote_friendly,
                job_type: job.job_type,
                experience_level: job.experience_level,
                created_at: job.created_at || new Date().toISOString(),
                // ADD MISSING FIELDS FOR JOB DISPLAY
                description: job.description,
                skills_required: job.skills_required,
                requirements: job.requirements,
                benefits: job.benefits
            }));

            // Log performance in development
            if (process.env.NODE_ENV === 'development') {
                console.log(`🎯 Unified recommendations loaded in ${latency.toFixed(2)}ms (${jobs.length} jobs)`);
            }

            return {
                jobs,
                total: response.count || jobs.length,
                page: Math.floor(offset / limit),
                limit,
                hasMore: jobs.length === limit,
                performance: {
                    latency_ms: latency,
                    cache_hit: latency < 100
                }
            };
        } catch (error) {
            console.error('Unified recommendations failed:', error);
            // Fallback to vector recommendations
            return this.getVectorJobRecommendations(0, limit);
        }
    }

    /**
     * Calculate match score between user and job using unified service
     */
    static async calculateMatchScore(
        userId: string,
        jobId: string,
        includeBreakdown: boolean = false
    ): Promise<{
        total_score: number;
        match_percentage: number;
        match_level: string;
        scoring_method: string;
        breakdown?: Record<string, number>;
    }> {
        try {
            const endpoint = `${this.unifiedBaseUrl}/match-score`;
            const response = await apiClient.post(endpoint, {
                user_id: userId,
                job_id: jobId,
                include_breakdown: includeBreakdown
            });

            return {
                total_score: (response as any).total_score,
                match_percentage: (response as any).match_percentage,
                match_level: (response as any).match_level,
                scoring_method: (response as any).scoring_method,
                breakdown: (response as any).breakdown
            };
        } catch (error) {
            console.error('Match score calculation failed:', error);
            throw error;
        }
    }

    /**
     * Calculate match scores for multiple jobs (bulk operation)
     */
    static async calculateBulkMatchScores(
        userId: string,
        jobIds: string[]
    ): Promise<Array<{
        job_id: string;
        total_score: number;
        match_percentage: number;
        match_level: string;
    }>> {
        try {
            const endpoint = `${this.unifiedBaseUrl}/bulk-match`;
            const response = await apiClient.post(endpoint, {
                user_id: userId,
                job_ids: jobIds
            });

            return (response as any).matches.map((match: any) => ({
                job_id: match.job_id,
                total_score: match.total_score,
                match_percentage: match.match_percentage,
                match_level: match.match_level
            }));
        } catch (error) {
            console.error('Bulk match calculation failed:', error);
            throw error;
        }
    }

    /**
     * Get unified service statistics and health information
     */
    static async getServiceStats(): Promise<{
        feature_flags: Record<string, boolean>;
        scoring_weights: Record<string, number>;
        cache_stats: any;
        performance_stats: any;
        service_status: string;
    }> {
        try {
            const endpoint = `${this.unifiedBaseUrl}/service-stats`;
            return await apiClient.get(endpoint);
        } catch (error) {
            console.error('Failed to get service stats:', error);
            throw error;
        }
    }

    /**
     * Get cache statistics
     */
    static async getCacheStats(): Promise<{
        cache_stats: any;
        timestamp: string;
    }> {
        try {
            const endpoint = `${this.unifiedBaseUrl}/cache-stats`;
            return await apiClient.get(endpoint);
        } catch (error) {
            console.error('Failed to get cache stats:', error);
            throw error;
        }
    }

    /**
     * Clear unified service cache
     */
    static async clearUnifiedCache(cacheType?: string): Promise<boolean> {
        try {
            const query = cacheType ? `?cache_type=${cacheType}` : '';
            const endpoint = `${this.unifiedBaseUrl}/clear-cache${query}`;
            await apiClient.post(endpoint, {});
            console.log('✅ Unified cache cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear unified cache:', error);
            return false;
        }
    }

    /**
     * Update feature flags (admin function)
     */
    static async updateFeatureFlag(flagName: string, enabled: boolean): Promise<boolean> {
        try {
            const endpoint = `${this.unifiedBaseUrl}/feature-flags/${flagName}`;
            const query = new URLSearchParams({ enabled: enabled.toString() });
            await apiClient.post(`${endpoint}?${query.toString()}`, {});
            console.log(`✅ Feature flag ${flagName} set to ${enabled}`);
            return true;
        } catch (error) {
            console.error(`Failed to update feature flag ${flagName}:`, error);
            return false;
        }
    }

    /**
     * Get current feature flags
     */
    static async getFeatureFlags(): Promise<Record<string, boolean>> {
        try {
            const endpoint = `${this.unifiedBaseUrl}/feature-flags`;
            const response = await apiClient.get(endpoint);
            return (response as any).feature_flags;
        } catch (error) {
            console.error('Failed to get feature flags:', error);
            return {};
        }
    }

    /**
     * Health check for unified service
     */
    static async healthCheck(): Promise<{
        status: string;
        service: string;
        feature_flags: number;
        total_feature_flags: number;
    }> {
        try {
            const endpoint = `${this.unifiedBaseUrl}/health`;
            return await apiClient.get(endpoint);
        } catch (error) {
            console.error('Health check failed:', error);
            return {
                status: 'unhealthy',
                service: 'unified_match_service',
                feature_flags: 0,
                total_feature_flags: 0
            };
        }
    }

}

