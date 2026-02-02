import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import { JestParser, PlaywrightParser, CypressParser, VitestParser, MochaParser } from '../parsers/parsers';
import { Analyzer } from '../core/analyzer';
import { HtmlReporter } from '../reporters/html';
import { NotificationService } from '../reporters/notifications';
import { FinalReport } from '../core/types';

const program = new Command();

program
    .name('failsafe-report')
    .description('Intelligent and Fail-Safe test reporting for modern teams')
    .version('1.0.1');

program
    .command('generate')
    .description('Generate a report from test results')
    .argument('<path>', 'Path to test results file (JSON)')
    .option('--framework <type>', 'Force framework type (jest, playwright, cypress, vitest, mocha)')
    .option('--output <path>', 'Output path for HTML report', 'test-report.html')
    .option('--slack <webhook>', 'Slack webhook URL for notifications')
    .option('--ci', 'CI mode (exit with code 1 if tests failed)')
    .action(async (path, options) => {
        const spinner = ora('Parsing test results...').start();

        try {
            if (!fs.existsSync(path)) {
                spinner.fail(chalk.red(`Error: File not found at ${path}`));
                process.exit(1);
            }

            const content = await fs.readJson(path);
            const parsers = [
                new JestParser(),
                new PlaywrightParser(),
                new CypressParser(),
                new VitestParser(),
                new MochaParser()
            ];

            let parser = parsers.find(p => p.canParse(content));
            if (options.framework) {
                parser = parsers.find(p => p.name === options.framework.toLowerCase());
            }

            if (!parser) {
                spinner.fail(chalk.red('Error: Could not detect framework. Use --framework to specify.'));
                process.exit(1);
            }

            spinner.text = `Parsing ${parser.name} results...`;
            let report = parser.parse(content);

            spinner.text = 'Analyzing failures...';
            report = await Analyzer.analyze(report);

            spinner.text = 'Generating HTML report...';
            HtmlReporter.generate(report, options.output);

            if (options.slack) {
                spinner.text = 'Sending Slack notification...';
                await NotificationService.send(report, { type: 'slack', webhookUrl: options.slack });
            }

            spinner.succeed(chalk.green(`Report generated successfully at ${options.output}`));

            console.log('\n' + chalk.bold('Summary:'));
            console.log(`- Total: ${report.summary.total}`);
            console.log(`- Passed: ${chalk.green(report.summary.passed)}`);
            console.log(`- Failed: ${chalk.red(report.summary.failed)}`);

            if (report.insights && report.insights.length > 0) {
                console.log('\n' + chalk.cyan.bold('💡 Insights:'));
                report.insights.forEach(i => console.log(chalk.cyan(`- ${i}`)));
            }

            if (options.ci && report.summary.failed > 0) {
                process.exit(1);
            }
        } catch (error: any) {
            spinner.fail(chalk.red(`Error: ${error.message}`));
            process.exit(1);
        }
    });

program
    .command('leaderboard')
    .description('Show the test quality leaderboard (Experimental)')
    .action(() => {
        console.log(chalk.red.bold('\n🛡️ FailSafe Leaderboard - Top Contributors to Test Stability\n'));

        const mockData = [
            { name: 'Mallik Galib', score: 100, stableTests: 52, badge: '👑 Legend' },
            { name: 'Alex', score: 98, stableTests: 45, badge: '🛡️ Guardian' },
            { name: 'Sarah', score: 95, stableTests: 38, badge: '⚡ Speedster' },
            { name: 'John', score: 92, stableTests: 41, badge: '🧪 Chemist' }
        ];

        console.table(mockData);
        console.log(chalk.dim('\nJoin the leaderboard by writing tests with 0 flakiness!'));
    });

export { program };
