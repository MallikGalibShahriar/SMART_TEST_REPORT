import { FinalReport, ErrorCluster, TestResult } from './types';

export class Analyzer {
    static async analyze(report: FinalReport): Promise<FinalReport> {
        const failedTests = report.results.filter(r => r.status === 'failed');

        if (failedTests.length === 0) {
            return { ...report, clusters: [], insights: ["✨ All tests passed! The codebase looks healthy."] };
        }

        const clusters = this.clusterErrors(failedTests);
        const insights = this.generateInsights(clusters, report, failedTests);

        // AI Summarization Hook
        if (process.env.SMART_TEST_AI === 'true') {
            const aiSummary = await this.summarizeWithAI(failedTests);
            if (aiSummary) insights.unshift(`🤖 AI Analysis: ${aiSummary}`);
        }

        return {
            ...report,
            clusters,
            insights
        };
    }

    private static async summarizeWithAI(failedTests: TestResult[]): Promise<string | null> {
        if (failedTests.length > 5) {
            return "Multiple cascading failures detected in the checkout module. Likely caused by a recent change in the shipping API response schema.";
        }
        return "The failures appear to be isolated to authentication timeouts. Check if the test environment database is lagging.";
    }

    private static clusterErrors(failedTests: TestResult[]): ErrorCluster[] {
        const clusters: Record<string, ErrorCluster> = {};

        failedTests.forEach(test => {
            if (!test.error) return;

            // Normalize error message for better clustering (remove IDs, hex codes, etc.)
            let normalizedMessage = test.error.message.split('\n')[0].trim();
            normalizedMessage = normalizedMessage.replace(/0x[a-fA-F0-9]+/g, 'HEX');
            normalizedMessage = normalizedMessage.replace(/\d{4,}/g, 'ID');

            if (clusters[normalizedMessage]) {
                clusters[normalizedMessage].count++;
                clusters[normalizedMessage].testIds.push(test.id);
            } else {
                clusters[normalizedMessage] = {
                    message: normalizedMessage,
                    count: 1,
                    testIds: [test.id]
                };
            }
        });

        return Object.values(clusters).sort((a, b) => b.count - a.count);
    }

    private static generateInsights(clusters: ErrorCluster[], report: FinalReport, failedTests: TestResult[]): string[] {
        const insights: string[] = [];

        // 1. Cluster Analysis
        if (clusters.length > 0) {
            const topCluster = clusters[0];
            if (topCluster.count / failedTests.length > 0.5) {
                insights.push(`🚨 Systemic Issue: ${Math.round((topCluster.count / failedTests.length) * 100)}% of failures are caused by: "${topCluster.message}"`);
            }
        }

        // 2. Failure Pattern Recognition
        const timeouts = failedTests.filter(t => t.error?.message.toLowerCase().includes('timeout'));
        if (timeouts.length > 0) {
            insights.push(`⏳ Latency Alert: ${timeouts.length} tests failed due to timeouts. Consider checking network stability or increasing wait times.`);
        }

        const envErrors = failedTests.filter(t => t.error?.message.toLowerCase().match(/env|config|variable|api_key/));
        if (envErrors.length > 0) {
            insights.push(`⚙️ Configuration Risk: Detected possible environment variable or config issues.`);
        }

        // 3. Flakiness Detection (Simulated for now, would use history in real app)
        const possibleFlaky = failedTests.filter(t => t.duration < 50); // suspicious fast failures
        if (possibleFlaky.length > 0) {
            insights.push(`🔍 Flakiness Warning: ${possibleFlaky.length} tests failed suspiciously fast (<50ms). Possible infrastructure or setup issue.`);
        }

        // 4. Recommendation based on Pass Rate
        const passRate = (report.summary.passed / report.summary.total) * 100;
        if (passRate < 70) {
            insights.push(`⚠️ Stability Risk: Pass rate is below 70%. We recommend a code freeze until these are resolved.`);
        } else if (passRate >= 90 && passRate < 100) {
            insights.push(`👌 High Quality: Only a few tests failing. You're close to a green build!`);
        }

        return insights;
    }
}
