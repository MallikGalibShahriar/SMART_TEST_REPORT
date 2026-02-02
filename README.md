# 🛡️ FailSafe Report

**Intelligent, Programmer-Centric, and Actionable Test Reporting for Modern Teams.**

FailSafe transforms messy test logs into a clean, professional dashboard. It doesn't just show results; it analyzes them using heuristics to suggest root causes and cluster failures, ensuring your builds are truly "Fail-Safe".

![Branding: FailSafe](https://img.shields.io/badge/Brand-FailSafe-red)
![Theme: Programmer-Centric](https://img.shields.io/badge/UI-Programmer--Centric-blue)
![Author: Mallik Galib Shahriar](https://img.shields.io/badge/Author-Mallik%20Galib-indigo)

---

## ✨ Features

- **🛡️ Fail-Safe Analysis**: Heuristic engine that detects latency, configuration risks, and systemic issues.
- **👨‍💻 Programmer-Centric UI**: A high-contrast, white-themed dashboard. Uses **Fira Code** for logs and **Inter** for UI.
- **🧠 Intelligent Heuristics**: 
    - **Latency Detection**: Flags tests failing due to timeouts.
    - **Systemic Failure Analysis**: Identifies if a single issue is causing multiple test failures.
    - **Environment Audit**: Detects missing or misconfigured environment variables.
- **🌈 Smart Clustering**: Groups identical errors together so you solve 1 problem to fix 10 tests.
- **💬 Team Notifications**: Instant Slack and Microsoft Teams alerts.
- **🏆 Stability Leaderboard**: Gamify your team's testing culture with contributors' stability scores.
- **🤖 AI Multiplier**: Built-in hooks for GPT/Gemini based failure summarization.

---

## 📦 Installation

```bash
npm install @mallikgalibshahriar/failsafe-report --save-dev
```

## �️ How to Generate Test Results (JSON)

To use **FailSafe Report**, you first need to generate a JSON report from your testing framework. Here’s how:

### For Jest
Run your tests with the following command to generate a `results.json` file:
```bash
npm test -- --json --outputFile=results.json
```

### For Playwright
Run your tests using the JSON reporter:
```bash
npx playwright test --reporter=json > results.json
```

### For Cypress
Install `cypress-mochawesome-reporter` and generate a JSON output:
```bash
npx cypress run --reporter mochawesome --reporter-options reportDir=cypress/results,overwrite=false,html=false,json=true
```

### For Vitest
Use the `json` reporter:
```bash
npx vitest run --reporter=json --outputFile=results.json
```

### For Mocha
Use the built-in `json` reporter:
```bash
npx mocha --reporter json > results.json
```

---

## 🚀 Quick Start

### 1. Generate FailSafe Report
Once you have your `results.json` file, run:

```bash
npx @mallikgalibshahriar/failsafe-report generate ./results.json --output report.html
```

**Options:**
- `--framework <jest|playwright|cypress|vitest|mocha>`: Force framework detection.
- `--output <path>`: Custom report filename (e.g., `failsafe-report.html`).
- `--slack <webhook>`: Send a smart summary to your Slack channel.
- `--ci`: Exit with code 1 if tests fail.

### 2. View Leaderboard

```bash
npx @mallikgalibshahriar/failsafe-report leaderboard
```

---

## 📄 License

MIT © [Mallik Galib Shahriar](https://www.linkedin.com/in/mallikgalibshahriar/)
