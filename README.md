
# UAPI QC – Playwright + TypeScript (Fixed Login Selectors)

This repo is ready to run against https://qc.uapi.sa with placeholder-based login selectors.

## Setup
```
npm i
npx playwright install --with-deps
cp .env.example .env
# set BASE_URL=https://qc.uapi.sa and TEST_USERNAME/TEST_PASSWORD
```

## Run
```
npm test
# or UI:
npm run test:ui
```
