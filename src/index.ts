import { program } from './cli';
import { JestParser, PlaywrightParser } from './parsers/parsers';
import { Analyzer } from './core/analyzer';
import { HtmlReporter } from './reporters/html';
import { NotificationService } from './reporters/notifications';

// For API usage
const reporter = {
    generate: async (options: {
        results: any,
        framework?: 'jest' | 'playwright',
        outputPath?: string,
        notifications?: { type: 'slack' | 'teams', webhookUrl: string }[]
    }) => {
        const parsers = [new JestParser(), new PlaywrightParser()];
        let parser = parsers.find(p => p.canParse(options.results));

        if (options.framework) {
            parser = parsers.find(p => p.name === options.framework);
        }

        if (!parser) throw new Error('Could not detect framework');

        let report = parser.parse(options.results);
        report = await Analyzer.analyze(report);

        if (options.outputPath) {
            HtmlReporter.generate(report, options.outputPath);
        }

        if (options.notifications) {
            for (const config of options.notifications) {
                await NotificationService.send(report, config);
            }
        }

        return report;
    },
    analyze: async (report: any) => await Analyzer.analyze(report)
};

export default reporter;
export { program };
