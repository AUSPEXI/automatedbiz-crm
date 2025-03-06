class AIInsightsService {
  // ... existing methods ...

  private analyzeVideoPerformance(members: any[], videos: any[]): { insight?: AIInsight } {
    if (!members?.length || !videos?.length) return {};
    try {
      const avgEngagement = videos.reduce((acc, v) => acc + (v.analytics?.engagement || 0), 0) / videos.length;
      const optimalDuration = avgEngagement > 0.5 ? 90 : 60; // Simple logic, free
      const engagementBoost = avgEngagement < 0.5 ? 15 : 5; // Example logic
      return {
        insight: {
          type: 'suggestion',
          title: 'Optimize Video Length',
          description: `Videos show ${avgEngagement.toFixed(2)} engagement. Adjust length to ${optimalDuration}s for a ${engagementBoost}% boost.`,
          impact: 'medium',
          action: 'Edit Video',
          confidence: 0.8,
        },
      };
    } catch (error) {
      return {};
    }
  }
}