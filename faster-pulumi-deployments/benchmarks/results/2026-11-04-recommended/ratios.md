| Change deployed to three stacks | Approach | Source time ÷ approach time, per deployment | Including one build on GitHub Actions | Including one build on EC2 |
| --- | --- | ---: | ---: | ---: |
| Source edit to existing stacks | Custom executor image | 1.04 | 0.86 | 1.00 |
| Source edit to existing stacks | Release bundle | 0.95 | 0.89 | 0.93 |
| Dependency update to existing stacks | Custom executor image | 4.74 | 2.82 | 4.50 |
| Dependency update to existing stacks | Release bundle | 3.58 | 2.64 | 3.46 |
| First deployment to new stacks | Custom executor image | 4.64 | 2.82 | 3.17 |
| First deployment to new stacks | Release bundle | 3.67 | 2.68 | 2.93 |
