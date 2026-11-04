| Comparison | Metric | Ratio |
| --- | --- | ---: |
| Image deployment: cold node ÷ image on node (IfNotPresent) | job | 1.57 |
| Image deployment: Always ÷ IfNotPresent, image on node | job | 1.06 |
| Image deployment: new release ÷ image on node (IfNotPresent) | job | 1.14 |
| Dependency update: no cache volume ÷ cache volume | job | 4.70 |
| Dependency update: source without cache volume ÷ new image release | job | 4.83 |
| Dependency update: source with cache volume ÷ new image release | job | 1.03 |
| New stack: source with cache volume ÷ new image release | job | 1.12 |

| Condition | Job | Setup | Source | Dependency installation | Pre-run | Pulumi operation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Image, cold node | 15.8 | 0.4 | 3.4 | 0.0 | 1.3 | 2.9 |
| Image on node, IfNotPresent | 10.0 | 0.4 | 3.6 | 0.0 | 1.1 | 2.5 |
| Image on node, Always | 10.7 | 0.5 | 3.7 | 0.0 | 1.2 | 2.5 |
| New image release, base layers on node | 11.4 | 0.4 | 3.6 | 0.0 | 1.2 | 2.7 |
| Source, dependency update, no Go cache volume | 55.2 | 0.3 | 3.8 | 5.4 | 1.1 | 41.3 |
| Source, dependency update, Go cache volume | 11.8 | 0.3 | 3.7 | 0.9 | 1.1 | 3.4 |
| Source, new stack, Go cache volume | 12.9 | 0.4 | 3.5 | 1.1 | 1.3 | 3.9 |
