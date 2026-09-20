# WorthFixing

**Repair it or replace it? Take a photo and get a practical second opinion.**

WorthFixing is a lightweight AI decision tool for everyday broken objects. Upload a photo and it returns a simple verdict: **Fix**, **Maybe**, or **Replace**, with visible damage notes, repair difficulty, a cost band, safety context, and the next useful step.

## Why it exists

People throw things away because they do not know whether a repair is simple, safe, or worth the effort. WorthFixing turns that uncertainty into a quick, explainable decision.

## Demo mode

The landing page includes a built-in broken-chair example. It works with no API key, so the full product flow can be demonstrated immediately.

## Real image analysis

Real uploads are analyzed server-side with the OpenAI Responses API. The API key is never exposed to the browser.

1. `npm install`
2. Copy `.env.example` to `.env.local`
3. Add `OPENAI_API_KEY`
4. `npm run dev`

## Tech

- Next.js App Router
- TypeScript
- OpenAI Responses API with image input
- CSS-first responsive UI, no component-library dependency

## Product rule

WorthFixing never claims to see hidden/internal damage and never invents exact repair prices from a photo. It uses a cost band and lowers confidence when the image is ambiguous.
