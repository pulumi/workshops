# AGENTS.md -- 04-sample-app

`app/` is a plain Node/Express service, not a Pulumi project; it has its own
`package.json` and is built by `build-and-load.sh`, not by `npm install` at
the folder root. The Pulumi project here (`index.ts`) only deploys the image
`build-and-load.sh` already built and loaded into kind -- it never runs
`docker build`.

Run `build-and-load.sh` before `pulumi up` in this folder, every time
`app/`'s code changes; kind does not see image changes on its own, and a
stale image with `imagePullPolicy: Never` fails closed (`ErrImageNeverPull`)
rather than silently pulling a newer one.
