# 🚀 Smart Test Reporter (SmartTest)

**Intelligent, Pro-Dev, and Actionable Test Reporting for Modern Teams.**

SmartTest transforms messy test logs into a clean, programmer-centric dashboard. It doesn't just show results; it analyzes them using heuristics to suggest root causes and cluster failures.

![Design: Programmer-Centric](https://img.shields.io/badge/UI-Programmer--Centric-blue)
![Theme: White Professional](https://img.shields.io/badge/Theme-White%20Professional-brightgreen)
![Author: Mallik Galib Shahriar](https://img.shields.io/badge/Author-Mallik%20Galib-indigo)

---

## ✨ Features

- **👨‍💻 Programmer-Centric UI**: A high-contrast, white-themed dashboard designed for clarity. Uses **Fira Code** for logs and **Inter** for UI.
- **🧠 Intelligent Heuristics**: 
    - **Latency Detection**: Automatically flags tests failing due to timeouts.
    - **Systemic Failure Analysis**: Identifies if a single issue is causing multiple test failures.
    - **Environment Audit**: Detects missing or misconfigured environment variables.
- **🌈 Smart Clustering**: Groups identical errors together so you solve 1 problem to fix 10 tests.
- **通知 Team Notifications**: Instant **Slack** and **Microsoft Teams** alerts with critical failure insights.
- **🏆 Stability Leaderboard**: Gamify your team's testing culture with contributors' stability scores.
- **🤖 AI Multiplier**: Built-in hooks for GPT/Gemini based failure summarization.

---

## 📦 Installation

```bash
npm install smart-test-reporter --save-dev
```

## 🚀 Quick Start

### 1. Generate Report via CLI

Run your tests and save the result as JSON (Jest or Playwright), then run:

```bash
npx smart-test-reporter generate ./results.json --output report.html
```

**Options:**
- `--framework <jest|playwright>`: Force framework detection.
- `--output <path>`: Custom report filename (e.g., `qa-summary.html`).
- `--slack <webhook>`: Send a smart summary to your Slack channel.
- `--ci`: Exit with code 1 if tests fail (for Pipeline integration).

### 2. View Leaderboard

Check who's writing the most stable tests in your project:

```bash
npx smart-test-reporter leaderboard
```

### 3. API Usage

```javascript
import reporter from 'smart-test-reporter';

await reporter.generate({
  results: yourJsonData,
  outputPath: './test-report.html',
  notifications: [{ type: 'slack', webhookUrl: '...' }]
});
```

---

## 🛠 Support Matrix

- ✅ **Jest**: Run with `--json --outputFile=results.json`
- ✅ **Playwright**: Run with `--reporter=json`
- 🚧 **Cypress / Mocha**: Coming Soon.

---

## 🎨 Why SmartTest?

Modern testing tools are either too heavy or too basic. SmartTest lives in the middle:
- **Fast**: Generates reports in milliseconds.
- **Actionable**: Tells you "This looks like a Database Timeout" instead of just "Test Failed".
- **Beautiful**: A clean, professional aesthetic that fits perfectly in a developer's workflow.

---

## 📄 License

MIT © [Mallik Galib Shahriar](https://www.linkedin.com/in/mallikgalibshahriar/)
