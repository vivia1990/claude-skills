<!-- contract: e2e-setup v1 -->
<!--
Purpose: sets up what every e2e workflow issue shares: the framework, starting the app under test, the fixtures, a smoke test and CI.
Lifecycle: not grilled. Opened `ready`, because its choices were reviewed when the e2e plan was approved. Every e2e workflow issue depends on this one.
Labels: the opener applies `e2e`.
Implementer: this is the only e2e issue that creates or changes shared test code: config, fixtures, helpers.
-->

## Summary

## Framework

## Starting the app under test

## Fixtures

## Smoke test

## CI job

## How to run locally

## Acceptance criteria
<!-- implementer ticks these -->

- [ ] Framework installed and configured
- [ ] Every fixture listed above is implemented and documented
- [ ] Smoke test starts the app and passes
- [ ] CI runs the e2e suite on every merge/pull request and fails the pipeline on test failure
- [ ] PR merged with CI green
