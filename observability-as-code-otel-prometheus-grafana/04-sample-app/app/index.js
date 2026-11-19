"use strict";

const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

// A little synthetic latency and an occasional error give step 7's load
// generator something to show in Grafana: a moving latency graph, real
// traces with a couple of spans, and the alert from step 6 firing when the
// error rate climbs.
app.get("/", (_req, res) => {
    res.json({ service: "observability-sample-app", status: "ok" });
});

app.get("/work", async (_req, res) => {
    const delayMs = 50 + Math.random() * 200;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (Math.random() < 0.1) {
        res.status(500).json({ error: "simulated failure" });
        return;
    }
    res.json({ service: "observability-sample-app", delayMs: Math.round(delayMs) });
});

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.listen(port, () => {
    console.log(`observability-sample-app listening on :${port}`);
});
