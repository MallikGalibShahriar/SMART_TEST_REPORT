import { FinalReport, TestResult, TestSummary } from '../core/types';
import * as fs from 'fs-extra';

export abstract class BaseParser {
    abstract name: string;
    abstract canParse(content: any): boolean;
    abstract parse(content: any): FinalReport;
}

export class JestParser extends BaseParser {
    name = 'jest';

    canParse(content: any): boolean {
        return content && content.numTotalTests !== undefined && content.testResults !== undefined;
    }

    parse(content: any): FinalReport {
        const results: TestResult[] = [];

        content.testResults.forEach((suite: any) => {
            suite.assertionResults.forEach((test: any) => {
                results.push({
                    id: `${suite.name}-${test.title}`,
                    name: test.title,
                    suite: suite.name,
                    status: test.status === 'passed' ? 'passed' : test.status === 'failed' ? 'failed' : 'skipped',
                    duration: test.duration || 0,
                    error: test.failureMessages && test.failureMessages.length > 0 ? {
                        message: test.failureMessages[0],
                        stack: test.failureMessages.join('\n')
                    } : undefined
                });
            });
        });

        const summary: TestSummary = {
            total: content.numTotalTests,
            passed: content.numPassedTests,
            failed: content.numFailedTests,
            skipped: content.numPendingTests,
            flaky: 0, // Jest doesn't natively report flakiness in the basic JSON output without extra tags
            duration: Date.now() - content.startTime, // approximate or from content if available
            framework: 'jest',
            timestamp: new Date().toISOString()
        };

        return { summary, results };
    }
}

export class PlaywrightParser extends BaseParser {
    name = 'playwright';

    canParse(content: any): boolean {
        return content && content.config && content.suites;
    }

    parse(content: any): FinalReport {
        const results: TestResult[] = [];

        const walkSuites = (suites: any[]) => {
            suites.forEach(suite => {
                if (suite.specs) {
                    suite.specs.forEach((spec: any) => {
                        spec.tests.forEach((test: any) => {
                            const result = test.results[0];
                            results.push({
                                id: spec.id || `${suite.title}-${spec.title}`,
                                name: spec.title,
                                suite: suite.title,
                                status: result.status === 'expected' ? 'passed' : result.status === 'unexpected' ? 'failed' : 'skipped',
                                duration: result.duration || 0,
                                error: result.error ? {
                                    message: result.error.message,
                                    stack: result.error.stack
                                } : undefined
                            });
                        });
                    });
                }
                if (suite.suites) walkSuites(suite.suites);
            });
        };

        walkSuites(content.suites);

        const summary: TestSummary = {
            total: results.length,
            passed: results.filter(r => r.status === 'passed').length,
            failed: results.filter(r => r.status === 'failed').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            flaky: 0,
            duration: content.stats?.duration || 0,
            framework: 'playwright',
            timestamp: new Date().toISOString()
        };

        return { summary, results };
    }
}

export class CypressParser extends BaseParser {
    name = 'cypress';

    canParse(content: any): boolean {
        return content && content.results && content.stats && content.stats.suites !== undefined;
    }

    parse(content: any): FinalReport {
        const results: TestResult[] = [];

        content.results.forEach((suite: any) => {
            suite.tests.forEach((test: any) => {
                results.push({
                    id: test.uuid || `${suite.title}-${test.title}`,
                    name: test.title,
                    suite: suite.title,
                    status: test.state === 'passed' ? 'passed' : test.state === 'failed' ? 'failed' : 'skipped',
                    duration: test.duration || 0,
                    error: test.err && Object.keys(test.err).length > 0 ? {
                        message: test.err.message,
                        stack: test.err.stack
                    } : undefined
                });
            });
        });

        const summary: TestSummary = {
            total: content.stats.tests,
            passed: content.stats.passes,
            failed: content.stats.failures,
            skipped: content.stats.pending,
            flaky: 0,
            duration: content.stats.duration,
            framework: 'cypress',
            timestamp: content.stats.start || new Date().toISOString()
        };

        return { summary, results };
    }
}

export class VitestParser extends BaseParser {
    name = 'vitest';

    canParse(content: any): boolean {
        return content && content.numTotalTests !== undefined && content.testResults !== undefined && content.startTime !== undefined;
    }

    parse(content: any): FinalReport {
        const results: TestResult[] = [];

        content.testResults.forEach((suite: any) => {
            suite.assertionResults.forEach((test: any) => {
                results.push({
                    id: `${suite.name}-${test.title}`,
                    name: test.title,
                    suite: suite.name,
                    status: test.status === 'passed' ? 'passed' : test.status === 'failed' ? 'failed' : 'skipped',
                    duration: test.duration || 0,
                    error: test.failureMessages && test.failureMessages.length > 0 ? {
                        message: test.failureMessages[0],
                        stack: test.failureMessages.join('\n')
                    } : undefined
                });
            });
        });

        const summary: TestSummary = {
            total: content.numTotalTests,
            passed: content.numPassedTests,
            failed: content.numFailedTests,
            skipped: content.numPendingTests,
            flaky: 0,
            duration: Date.now() - content.startTime,
            framework: 'vitest',
            timestamp: new Date().toISOString()
        };

        return { summary, results };
    }
}

export class MochaParser extends BaseParser {
    name = 'mocha';

    canParse(content: any): boolean {
        return content && content.stats && content.tests && Array.isArray(content.tests);
    }

    parse(content: any): FinalReport {
        const results: TestResult[] = content.tests.map((test: any) => ({
            id: test.fullTitle,
            name: test.title,
            suite: test.fullTitle.replace(test.title, '').trim(),
            status: test.err && Object.keys(test.err).length > 0 ? 'failed' : 'passed',
            duration: test.duration || 0,
            error: test.err && Object.keys(test.err).length > 0 ? {
                message: test.err.message,
                stack: test.err.stack
            } : undefined
        }));

        const summary: TestSummary = {
            total: content.stats.tests,
            passed: content.stats.passes,
            failed: content.stats.failures,
            skipped: content.stats.pending,
            flaky: 0,
            duration: content.stats.duration,
            framework: 'mocha',
            timestamp: content.stats.start || new Date().toISOString()
        };

        return { summary, results };
    }
}

