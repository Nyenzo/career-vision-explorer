import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import type {
    CofounderMatchProfile,
    CofounderMatchWithProfile,
    ConversationListResponse,
    MatchDiscoveryResponse,
    MatchListResponse,
    MatchStatistics,
} from "@/types/founder-matching";

export const cofounderQueryKeys = {
    all: ["cofounder-matching"] as const,
    profile: () => [...cofounderQueryKeys.all, "profile"] as const,
    statistics: () => [...cofounderQueryKeys.all, "statistics"] as const,
    mutualMatches: () => [...cofounderQueryKeys.all, "mutual-matches"] as const,
    matches: (statusFilter: string) => [...cofounderQueryKeys.all, "matches", statusFilter] as const,
    discovery: (limit: number, minScore: number) =>
        [...cofounderQueryKeys.all, "discovery", limit, minScore] as const,
    conversations: () => [...cofounderQueryKeys.all, "conversations"] as const,
};

export function useCofounderProfile() {
    return useQuery<CofounderMatchProfile>({
        queryKey: cofounderQueryKeys.profile(),
        queryFn: () => cofounderMatchingService.getProfile(),
    });
}

export function useCofounderStatistics() {
    return useQuery<MatchStatistics>({
        queryKey: cofounderQueryKeys.statistics(),
        queryFn: () => cofounderMatchingService.getStatistics(),
    });
}

export function useCofounderMutualMatches() {
    return useQuery<{ mutual_matches: CofounderMatchWithProfile[] }>({
        queryKey: cofounderQueryKeys.mutualMatches(),
        queryFn: () => cofounderMatchingService.getMutualMatches(),
    });
}

export function useCofounderMatches(statusFilter: string) {
    return useQuery<MatchListResponse>({
        queryKey: cofounderQueryKeys.matches(statusFilter),
        queryFn: () =>
            cofounderMatchingService.listMatches(
                statusFilter === "all" ? undefined : statusFilter,
                50,
                0,
            ),
    });
}

export function useCofounderDiscovery(limit = 10, minScore = 0.3) {
    return useQuery<MatchDiscoveryResponse>({
        queryKey: cofounderQueryKeys.discovery(limit, minScore),
        queryFn: () => cofounderMatchingService.discoverMatches({ limit, min_score: minScore }),
    });
}

export function useArchiveCofounderMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (matchId: string) => cofounderMatchingService.archiveMatch(matchId),
        onMutate: async (matchId) => {
            await queryClient.cancelQueries({ queryKey: cofounderQueryKeys.all });

            const previousMatches = queryClient.getQueriesData<MatchListResponse>({
                queryKey: [...cofounderQueryKeys.all, "matches"],
            });
            const previousMutualMatches = queryClient.getQueryData<{ mutual_matches: CofounderMatchWithProfile[] }>(
                cofounderQueryKeys.mutualMatches(),
            );

            previousMatches.forEach(([queryKey, value]) => {
                if (!value) {
                    return;
                }

                queryClient.setQueryData<MatchListResponse>(queryKey, {
                    ...value,
                    total: Math.max(0, value.total - Number(value.matches.some((match) => match.match_id === matchId))),
                    matches: value.matches.filter((match) => match.match_id !== matchId),
                });
            });

            if (previousMutualMatches) {
                queryClient.setQueryData(cofounderQueryKeys.mutualMatches(), {
                    mutual_matches: previousMutualMatches.mutual_matches.filter((match) => match.match_id !== matchId),
                });
            }

            return { previousMatches, previousMutualMatches };
        },
        onError: (_error, _matchId, context) => {
            context?.previousMatches?.forEach(([queryKey, value]) => {
                queryClient.setQueryData(queryKey, value);
            });

            if (context?.previousMutualMatches) {
                queryClient.setQueryData(cofounderQueryKeys.mutualMatches(), context.previousMutualMatches);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: cofounderQueryKeys.all });
        },
    });
}

export function useCofounderUnreadCount() {
    return useQuery<number>({
        queryKey: cofounderQueryKeys.conversations(),
        queryFn: async () => {
            const res = await cofounderMatchingService.getConversations(100, 0);
            return res.total_unread ?? 0;
        },
    });
}

/**
 * Global real-time sync for the Founder Dashboard.
 * Listens to new notifications and invalidates all cofounder-related queries 
 * to instantly update unread counts, pending matches, etc.
 */
export function useCofounderRealtimeSync() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user?.user_id) return;

        const channel = supabase.channel(`cofounder-global-sync-${user.user_id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.user_id}`,
                },
                () => {
                    // Refetch all cofounder queries when any notification arrives
                    // This updates messages, matches, and connections instantly
                    queryClient.invalidateQueries({ queryKey: cofounderQueryKeys.all });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.user_id, queryClient]);
}