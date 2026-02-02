import axios from 'axios';
import { FinalReport } from '../core/types';

export interface NotificationConfig {
    type: 'slack' | 'teams' | 'discord';
    webhookUrl: string;
}

export class NotificationService {
    static async send(report: FinalReport, config: NotificationConfig) {
        switch (config.type) {
            case 'slack':
                await this.sendToSlack(report, config.webhookUrl);
                break;
            case 'teams':
                await this.sendToTeams(report, config.webhookUrl);
                break;
            default:
                throw new Error(`Unsupported notification type: ${config.type}`);
        }
    }

    private static async sendToSlack(report: FinalReport, webhookUrl: string) {
        const summary = report.summary;
        const statusEmoji = summary.failed > 0 ? '❌' : '✅';

        const blocks: any[] = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `${statusEmoji} Test Report: ${summary.framework.toUpperCase()}`,
                    emoji: true
                }
            },
            {
                type: 'section',
                fields: [
                    { type: 'mrkdwn', text: `*Total:* ${summary.total}` },
                    { type: 'mrkdwn', text: `*Passed:* ${summary.passed} ✅` },
                    { type: 'mrkdwn', text: `*Failed:* ${summary.failed} ❌` },
                    { type: 'mrkdwn', text: `*Duration:* ${(summary.duration / 1000).toFixed(2)}s` }
                ]
            }
        ];

        if (report.insights && report.insights.length > 0) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Actionable Insights:*\n• ${report.insights.join('\n• ')}`
                }
            });
        }

        if (report.clusters && report.clusters.length > 0) {
            const topFailures = report.clusters.slice(0, 3).map(c => `*${c.count}x* \`${c.message}\``).join('\n');
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Top Failures:*\n${topFailures}`
                }
            });
        }

        try {
            await axios.post(webhookUrl, { blocks });
        } catch (err) {
            console.error('Failed to send Slack notification:', err);
        }
    }

    private static async sendToTeams(report: FinalReport, webhookUrl: string) {
        const summary = report.summary;
        const card = {
            type: 'message',
            attachments: [{
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: {
                    type: 'AdaptiveCard',
                    body: [
                        { type: 'TextBlock', size: 'Medium', weight: 'Bolder', text: `Test Report: ${summary.framework}` },
                        {
                            type: 'FactSet', facts: [
                                { title: 'Total', value: `${summary.total}` },
                                { title: 'Passed', value: `${summary.passed}` },
                                { title: 'Failed', value: `${summary.failed}` }
                            ]
                        }
                    ],
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    version: '1.2'
                }
            }]
        };
        try {
            await axios.post(webhookUrl, card);
        } catch (err) {
            console.error('Failed to send Teams notification:', err);
        }
    }
}
