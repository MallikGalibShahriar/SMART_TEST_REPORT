export interface TestResult {
    id: string;
    name: string;
    suite: string;
    status: 'passed' | 'failed' | 'skipped' | 'flaky';
    duration: number; // in ms
    error?: {
        message: string;
        stack?: string;
        diff?: string;
    };
    retries?: number;
    history?: {
        lastFiveStatuses: ('passed' | 'failed')[];
    };
}

export interface TestSummary {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    duration: number;
    framework: string;
    timestamp: string;
    environment?: string;
}

export interface FinalReport {
    summary: TestSummary;
    results: TestResult[];
    clusters?: ErrorCluster[];
    insights?: string[];
}

export interface ErrorCluster {
    message: string;
    count: number;
    testIds: string[];
}
