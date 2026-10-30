# Slides: bedrock-per-team-token-metering

Slidev deck for "Who Spent All the Tokens? Per-Team AI Cost Control as Code". 60 minutes, demo-only, presented by Adam Gordon Bell and Engin Diri on 2026-11-04. 27 slides; the per-slide run of show (56 minutes plus slack) lives in the gitignored `INTERNAL.md`, not in speaker notes.

## Story
1. The moment: an AI Engineer World's Fair 2026 session title asked "who spent all the tokens"; State of FinOps 2026: 98% of respondents manage AI spend, up from 31% in 2024.
2. The tension: nobody can say which team spent the tokens; one shared role hides the team behind the call.
3. Four questions (the map slide): who spent these tokens; what may a team call; what stops a mistake before it exists; how fast do the counts show up.
4. The answers: a tagged application inference profile per team; a role scoped to its own profile; a mandatory policy pack at preview; CloudWatch metrics in minutes versus cost allocation tags in up to a day.
5. The proof: the live demo meters real calls per team, denies a cross-team call, blocks two mistakes at preview, trips an alarm, tears everything down.

## Navigation
- `routeAlias: stage-<name>` on the first slide of each section (`map`, `who`, `what`, `stop`, `howfast`, `demo`, `wrap`).
- `components/StageMap.vue` reads those aliases: `size="lg"` on the map slide and the demo divider, `size="sm"` corner strip everywhere else via `global-top.vue`. Click a stage to jump. Covered stages are struck through or shown as ▪, upcoming as ◦; state is never colour-only.
- The map slide uses `<Link to="stage-…">` cards; the whole card is the click target.
- `components/DemoBadge.vue`: `● LIVE` pill on every demo-step h1.
- `.cue` (style.css): orange `ADAM:` / `ENGIN:` pill, bottom-right, on the demo slides where a handoff happens.
- `components/QRCode.vue`: QR codes on the Resources and Questions slides.

## Rules
- Speaker notes are talking points only. No timing budgets, no staging meta; that goes in `INTERNAL.md`.
- Code on slides is only demo commands copied verbatim from the numbered folders, in README order. No program code.
- No theme layouts except the cover; no Mermaid. Brand colours only via `var(--p-*)` tokens; the cue orange is the one exception. Adam is red-green colorblind: never signal state by red or green alone.
- Step 10 (budget) is pre-baked and not demoed; it gets one sentence on "Where this breaks today".
- Build: `npm ci && npm run build`. Export: `env -u NODE_OPTIONS npx slidev export slides.md --format png` (default output dir).

## Sources checked (2026-10-30)
- AWS: application inference profiles and cost allocation (24-hour tag activation, not retroactive; unsupported by Responses and Chat Completions APIs; one profile per model), model invocation logging (identity.arn, token counts).
- Pulumi: write a policy pack (mandatory violations fail preview), ESC aws-login provider.
- data.finops.org State of FinOps 2026; ai.engineer/worldsfair/2026/schedule.
- Demo folders: 3000-token alarm default, `<team>-nova` profile names, cc-1001 and cc-2002, two mandatory violations, three teardown checks.
