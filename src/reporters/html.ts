import { FinalReport } from '../core/types';
import * as fs from 'fs-extra';

export class HtmlReporter {
    static generate(report: FinalReport, outputPath: string) {
        const html = this.getTemplate(report);
        fs.outputFileSync(outputPath, html);
    }

    private static getTemplate(report: FinalReport): string {
        const { summary, results, insights } = report;
        const passPercentage = ((summary.passed / summary.total) * 100).toFixed(1);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartTest Report - ${summary.framework}</title>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #ffffff;
            --text-main: #1a1a1a;
            --text-muted: #666666;
            --border: #e1e4e8;
            --pass-bg: #e6ffed;
            --pass-text: #22863a;
            --fail-bg: #ffeef0;
            --fail-text: #cb2431;
            --skip-bg: #f6f8fa;
            --skip-text: #6a737d;
            --accent: #0366d6;
            --font-mono: 'Fira Code', monospace;
            --font-sans: 'Inter', -apple-system, sans-serif;
        }

        * { box-sizing: border-box; }

        body {
            font-family: var(--font-sans);
            background-color: var(--bg);
            color: var(--text-main);
            margin: 0;
            padding: 40px;
            line-height: 1.5;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
        }

        header {
            border-bottom: 2px solid var(--text-main);
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .title {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }

        .meta-info {
            font-family: var(--font-mono);
            font-size: 13px;
            color: var(--text-muted);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1px;
            background: var(--border);
            border: 1px solid var(--border);
            margin-bottom: 30px;
        }

        .stat-card {
            background: #fff;
            padding: 20px;
        }

        .stat-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-family: var(--font-mono);
            font-size: 24px;
            font-weight: 700;
        }

        .stat-value.passed { color: var(--pass-text); }
        .stat-value.failed { color: var(--fail-text); }

        .analysis-box {
            background: #fff;
            border: 2px solid var(--accent);
            padding: 20px;
            margin-bottom: 40px;
        }

        .analysis-box h2 {
            margin: 0 0 15px 0;
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .insight-item {
            font-family: var(--font-mono);
            font-size: 13px;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }

        .insight-item::before {
            content: ">";
            position: absolute;
            left: 0;
            color: var(--accent);
            font-weight: bold;
        }

        .filter-bar {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 10px;
        }

        .filter-btn {
            background: none;
            border: 1px solid var(--border);
            padding: 6px 12px;
            font-family: var(--font-mono);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.1s;
        }

        .filter-btn:hover { background: #f6f8fa; }
        .filter-btn.active {
            background: var(--text-main);
            color: #fff;
            border-color: var(--text-main);
        }

        .test-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        .test-table th {
            text-align: left;
            padding: 12px;
            background: #f6f8fa;
            border: 1px solid var(--border);
            font-weight: 700;
            text-transform: uppercase;
            font-size: 11px;
        }

        .test-row {
            border: 1px solid var(--border);
        }

        .test-row:hover { background: #fafbfc; }

        .test-row td {
            padding: 12px;
            border: 1px solid var(--border);
        }

        .status-pill {
            display: inline-block;
            padding: 2px 8px;
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 2px;
        }

        .pill-passed { background: var(--pass-bg); color: var(--pass-text); }
        .pill-failed { background: var(--fail-bg); color: var(--fail-text); }

        .test-duration {
            font-family: var(--font-mono);
            color: var(--text-muted);
            font-size: 12px;
        }

        .error-log {
            background: #1b1f23;
            color: #f6f8fa;
            padding: 15px;
            font-family: var(--font-mono);
            font-size: 12px;
            margin: 10px;
            white-space: pre-wrap;
            border-radius: 4px;
        }

        .test-info-cell {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .suite-tag {
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
            font-weight: 600;
        }

        footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            font-size: 12px;
            color: var(--text-muted);
            display: flex;
            justify-content: space-between;
        }

        footer a { color: var(--accent); text-decoration: none; }
        footer a:hover { text-decoration: underline; }

        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo-group">
                <div class="title">SMART_TEST_REPORT</div>
                <div class="meta-info">FRAMEWORK: ${summary.framework.toUpperCase()} // ENV: CI/PROD</div>
            </div>
            <div class="meta-info">
                TIMESTAMP: ${new Date(summary.timestamp).toISOString().replace('T', ' ').split('.')[0]}
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Tests</div>
                <div class="stat-value">${summary.total}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Passed</div>
                <div class="stat-value passed">${summary.passed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Failed</div>
                <div class="stat-value failed">${summary.failed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pass Rate</div>
                <div class="stat-value">${passPercentage}%</div>
            </div>
        </div>

        ${insights && insights.length > 0 ? `
        <div class="analysis-box">
            <h2>[ANALYSIS.LOG]</h2>
            ${insights.map(i => `<div class="insight-item">${i}</div>`).join('')}
        </div>
        ` : ''}

        <div class="filter-bar">
            <button class="filter-btn active" onclick="filterTests('all', this)">ALL_TESTS</button>
            <button class="filter-btn" onclick="filterTests('failed', this)">FAILED</button>
            <button class="filter-btn" onclick="filterTests('passed', this)">PASSED</button>
        </div>

        <table class="test-table">
            <thead>
                <tr>
                    <th style="width: 100px">Status</th>
                    <th>Test Definition</th>
                    <th style="width: 100px">Duration</th>
                </tr>
            </thead>
            <tbody id="test-body">
                ${results.map(test => `
                    <tr class="test-row" data-status="${test.status}">
                        <td>
                            <span class="status-pill pill-${test.status}">${test.status}</span>
                        </td>
                        <td>
                            <div class="test-info-cell" onclick="toggleError('${test.id}')" style="cursor: ${test.error ? 'pointer' : 'default'}">
                                <span class="suite-tag">${test.suite}</span>
                                <span class="test-name">${test.name}</span>
                                ${test.error ? `
                                    <div id="err-${test.id}" class="error-log hidden">${test.error.message}</div>
                                ` : ''}
                            </div>
                        </td>
                        <td class="test-duration">${test.duration}ms</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <footer>
            <div>
                © 2026 SmartTest Reporter // Version 1.0.0
            </div>
            <div>
                Built by <a href="https://www.linkedin.com/in/mallikgalibshahriar/" target="_blank">Mallik Galib Shahriar</a>
            </div>
        </footer>
    </div>

    <script>
        function filterTests(status, btn) {
            // Update buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter rows
            const rows = document.querySelectorAll('.test-row');
            rows.forEach(row => {
                if (status === 'all' || row.getAttribute('data-status') === status) {
                    row.classList.remove('hidden');
                } else {
                    row.classList.add('hidden');
                }
            });
        }

        function toggleError(id) {
            const errBox = document.getElementById('err-' + id);
            if (errBox) {
                errBox.classList.toggle('hidden');
            }
        }
    </script>
</body>
</html>
    `;
    }
}
