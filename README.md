# Finance Coach

A friendly AI financial coach that teaches money skills in small, clear steps. Learn budgeting, saving, and investing with real-life examples and helpful emojis. Perfect for beginners who want simple, confident steps to manage money. 💰📈

Demo: https://financecoach.vercel.app

## What it is (in very simple words)
Finance Coach is like a helpful teacher for your money. It explains things one step at a time, uses everyday examples, and makes learning about budgeting, investing, and money management easy and fun.

## Main features
- Clear, step-by-step lessons
- Real-life examples so you can apply ideas right away
- Friendly tone with emojis to make lessons easier to follow
- Works on phones, tablets, and computers

## Quick start (very simple)
Note: This repository is private. You need access to clone it.

1. Clone the repo (you must have permission)
```bash
git clone https://github.com/yorkright/Finance-Coach.git
cd Finance-Coach
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Run the app locally
```bash
npm run dev
# or
yarn dev
```

4. Open the app in your browser:
- Usually: http://localhost:3000
- If a different port is used, check the terminal output

If `npm run dev` doesn't exist, check `package.json` for the correct start script (for example `start` or `dev`).

## Environment variables (if needed)
If the app talks to AI services or external APIs, it may need a `.env` file. Look for a `.env.example` in the repo. Common examples:
```
# Example variables — only set what your project requires
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_API_URL=https://api.example.com
```

After creating `.env`, restart the dev server.

## How to contribute (very simple)
1. Ask the repo owner for access (this repo is private).
2. Create a new branch for your change:
```bash
git checkout -b feature/your-change
```
3. Make small, focused changes and commit them.
4. Push the branch and open a pull request.

## Troubleshooting (quick)
- If packages fail to install, try removing `node_modules` and reinstalling:
```bash
rm -rf node_modules package-lock.json
npm install
```
- If the server port is busy, pick another port or stop the process using it.

## License
This repository is currently private. Check with the project owner (yorkright) for license and contribution rules.


```
