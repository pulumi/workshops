# Slides: Building a Golden Path

Title: "Building a Golden Path". Subtitle: "Self-service infrastructure platforms with Pulumi". 90-120 minutes per the brief. Speaker-note budgets: story and demo slides about 77 minutes, frame slides about 8, total about 85.

## Story

1. **The moment.** Spotify Engineering, August 2020, "How We Use Golden Paths to Solve Fragmentation in Our Software Ecosystem" (https://engineering.atspotify.com/2020/08/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem/, read 2026-09-30). The page names no author; attribute to Spotify Engineering only. Quote: "...a fragmented ecosystem of developer tooling where the only way to find out how to do something was to ask your colleague. 'Rumour-driven development', we endearingly called it."
2. **The tension.** "Every team can ship infrastructure." / "No two teams ship it the same way."
3. **Why it is hard.** The standard is written down; the running account says otherwise. A document enforces nothing.
4. **The questions.** What does a team get; who can find it; what is guaranteed; what can they change; what happens when the platform changes it; how do they learn it broke and fix it.
5. **The answers.** A component with three inputs; git package plus the IDP private registry; guardrails in the component; only three inputs; a git tag is the version and a renamed input fails by name. Act 2 ends on "Where this breaks today".
6. **The proof.** A consuming team gets a compliant service in about a dozen lines, the same lines fail by name after a rename, and one property rename fixes it. It answers question six last.

## Brief section 5 accounting

| Brief slide | Where it landed |
| --- | --- |
| Title and promise | Generated frame |
| Problem: hand-rolling | Act 1: moment, two statements, compare |
| What a golden path is | Act 2 section one, plus the questions slide |
| Architecture diagram | "One platform team, one package" flow slide |
| Demo: authoring interface | 01-component demo step |
| Demo: implementing body | Merged into the 01-component step and "Behind the interface" slide |
| Publishing for discovery | Act 2 section two (PulumiPlugin.yaml, private registry) |
| Demo: consuming | 02-consume demo step, plus the YAML code slide |
| Versioning and breaking changes | Act 2 section four |
| Demo: breaking change | 03-breaking-change and fix steps |
| At scale | Omitted from the deck as its own slide; guardrails slide carries the idea. Flagged in the PR. |
| Demo: teardown | Omitted: no `pulumi up` ran in this build, so there is nothing to tear down. Flagged in the PR. |
| Recap of outcomes | Two recap-grid slides, including "Five questions answered, one to go" |
| Q&A and where to find the code | Generated closing frame |

marketing-web slidev-deck skill commit read: 9b37f9afe8c7b0d406f19bc9116b16d5689389ce.

## Fact-check

First pass only. A fact-check and humanizer pass follows after export.

| Claim | Source | Date read | Outcome |
| --- | --- | --- | --- |
| Spotify quote | engineering.atspotify.com post above | 2026-09-30 | Confirmed verbatim (by research step) |
| No registry-native short `pulumi package add` syntax | Private Registry concepts, `pulumi package add` reference, source-based plugin guide, Packaging Components guide | 2026-09-30 | Confirmed absent in all four |
| Pulumi CLI 3.266.0 current, 3.263.0 pinned at build | pulumi.com/docs/install | 2026-09-30 | Gap noted, pin kept |
| awsx v3.10.0 current, v3.9.0 at build | awsx GitHub releases | 2026-09-30 | No breaking change for the two APIs used |
| Three inputs, one output, type URN, error text, no `up` run | demo README and AGENTS.md | build run | Taken from the build record; not re-run here |
| Tag keys, exact naming pattern | not quoted on slides | n/a | Unverified; speaker note says check demo code |
