import React, { useState } from 'react';

const PIPELINE_DATA: Record<string, any> = {
  'developer': {
    icon: '💻', iconBg: '#1a1d25', iconBorder: '#3a3d4a',
    title: 'Developer workstation',
    subtitle: 'Where every pipeline run begins',
    color: '#e8eaf0',
    body: `
      <div class="block">
        <div class="block-label">What happens here</div>
        <p>The developer writes code locally, then commits and pushes to a remote Git repository. This single act — <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">git push</code> — fires the webhook that starts the entire pipeline. Nothing moves in the pipeline without it.</p>
      </div>
      <div class="highlight-box purple">
        The developer is the only human input at the start of the pipeline. Everything after push is automated until the manual approval gate before production.
      </div>
      <div class="block">
        <div class="block-label">Local workflow before push</div>
        <div class="mini-flow">
          <div class="flow-step">write code</div><div class="flow-arrow">→</div>
          <div class="flow-step">git add</div><div class="flow-arrow">→</div>
          <div class="flow-step">git commit</div><div class="flow-arrow">→</div>
          <div class="flow-step">git push</div>
        </div>
      </div>
      <div class="block">
        <div class="block-label">What good DevOps practice looks like</div>
        <p>Small, frequent commits (not one massive push per week). Each commit should be a single logical change. Feature branches keep work-in-progress off main. Pull Requests are the review gate before anything merges.</p>
      </div>
    `
  },
  'git': {
    icon: '⎇', iconBg: '#1d1a2e', iconBorder: '#534ab7',
    title: 'Git repository',
    subtitle: 'github / gitlab / bitbucket',
    color: '#a09aff',
    body: `
      <div class="block">
        <div class="block-label">Git's four roles in DevOps</div>
        <div class="tag-row">
          <span class="tag purple">Source of truth</span>
          <span class="tag purple">Branch strategy</span>
          <span class="tag purple">Webhook trigger</span>
          <span class="tag purple">Config as code</span>
        </div>
      </div>
      <div class="highlight-box danger">
        Common misconception: Git is not just storage. It is the event system that drives the entire pipeline. Push = pipeline start. Without Git firing, nothing moves.
      </div>
      <div class="block">
        <div class="block-label">Branch → environment mapping</div>
        <div class="mini-flow">
          <div class="flow-step">main</div><div class="flow-arrow">→</div>
          <div class="flow-step">production</div>
        </div>
        <div class="mini-flow" style="margin-top:8px">
          <div class="flow-step">develop</div><div class="flow-arrow">→</div>
          <div class="flow-step">staging</div>
        </div>
        <div class="mini-flow" style="margin-top:8px">
          <div class="flow-step">feature/*</div><div class="flow-arrow">→</div>
          <div class="flow-step">CI tests only</div>
        </div>
      </div>
      <div class="block">
        <div class="block-label">How the webhook works</div>
        <p>On every push, GitHub/GitLab sends an HTTP POST to Jenkins (or GitHub Actions). This payload contains the commit SHA, branch name, and author. Jenkins uses this to check out the exact commit and run the pipeline against it.</p>
      </div>
      <div class="block">
        <div class="block-label">Rollback: the killer feature</div>
        <p>Since every infra and code change is a commit, <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">git revert &lt;sha&gt;</code> creates a new commit that undoes a previous one — preserving audit history while instantly restoring known-good state.</p>
      </div>
    `
  },
  'jenkins': {
    icon: '⚙', iconBg: '#201e14', iconBorder: '#854f0b',
    title: 'Jenkins / GitHub Actions',
    subtitle: 'CI server — orchestrates the pipeline',
    color: '#f5a623',
    body: `
      <div class="block">
        <div class="block-label">What a CI server actually does</div>
        <p>Jenkins doesn't build your code — it orchestrates everything else that does. It receives the webhook, checks out the commit from Git, then runs each stage of your pipeline (build, test, scan, package, deploy) in sequence or in parallel.</p>
      </div>
      <div class="highlight-box warn">
        Jenkins vs GitHub Actions: Jenkins is self-hosted (you manage the server). GitHub Actions is managed by GitHub, runs in their cloud. For new projects in 2024, GitHub Actions is usually the simpler choice unless you need custom hardware or airgapped environments.
      </div>
      <div class="block">
        <div class="block-label">Jenkinsfile — pipeline as code</div>
        <p>The pipeline definition lives in a <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">Jenkinsfile</code> in the root of your repo. This means your pipeline config is version-controlled alongside your code. Change the pipeline? That's a commit. Roll it back? <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">git revert</code>.</p>
      </div>
      <div class="block">
        <div class="block-label">Pipeline stages in order</div>
        <div class="mini-flow">
          <div class="flow-step">checkout</div><div class="flow-arrow">→</div>
          <div class="flow-step">build</div><div class="flow-arrow">→</div>
          <div class="flow-step">test</div><div class="flow-arrow">→</div>
          <div class="flow-step">scan</div><div class="flow-arrow">→</div>
          <div class="flow-step">package</div><div class="flow-arrow">→</div>
          <div class="flow-step">deploy</div>
        </div>
      </div>
    `
  },
  'maven': {
    icon: '🔨', iconBg: '#201e14', iconBorder: '#854f0b',
    title: 'Maven / Gradle',
    subtitle: 'Build tool — compile and package',
    color: '#f5a623',
    body: `
      <div class="block">
        <div class="block-label">What Maven actually does</div>
        <p>Maven is not just a compiler. It manages the full build lifecycle: resolves dependencies from a registry (Maven Central), compiles source code, runs unit tests, packages the output into a <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">.jar</code> or <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">.war</code>, and optionally builds a Docker image.</p>
      </div>
      <div class="block">
        <div class="block-label">Maven vs Gradle</div>
        <table class="compare">
          <tr><th>Maven</th><th>Gradle</th></tr>
          <tr><td>XML config (pom.xml)</td><td>Groovy/Kotlin DSL</td></tr>
          <tr><td>Strict lifecycle</td><td>Flexible task graph</td></tr>
          <tr><td>Slower incremental builds</td><td>Faster — incremental by default</td></tr>
          <tr><td>Java ecosystem default</td><td>Android / multi-lang default</td></tr>
        </table>
      </div>
      <div class="highlight-box">
        Key concept: Maven's <code style="font-family:JetBrains Mono;font-size:12px">mvn package</code> runs compile + test + package in one command. In a CI pipeline, Jenkins calls this — not the developer. No manual builds in production pipelines.
      </div>
      <div class="block">
        <div class="block-label">Output of the build stage</div>
        <div class="mini-flow">
          <div class="flow-step">source code</div><div class="flow-arrow">→</div>
          <div class="flow-step">Maven</div><div class="flow-arrow">→</div>
          <div class="flow-step">.jar / Docker image</div>
        </div>
      </div>
    `
  },
  'sonarqube': {
    icon: '🔍', iconBg: '#1a1d25', iconBorder: '#3a3d4a',
    title: 'SonarQube',
    subtitle: 'Static code analysis — runs parallel to build',
    color: '#e8eaf0',
    body: `
      <div class="block">
        <div class="block-label">What SonarQube checks</div>
        <div class="tag-row">
          <span class="tag teal">Code smells</span>
          <span class="tag amber">Security vulnerabilities</span>
          <span class="tag red">Bugs</span>
          <span class="tag blue">Test coverage %</span>
          <span class="tag purple">Duplicated code</span>
        </div>
      </div>
      <div class="highlight-box warn">
        SonarQube runs in parallel with the build step, not after it. Waiting for compilation to finish before starting a static scan wastes pipeline time. They use different inputs — SonarQube reads source files, Maven reads compiled bytecode.
      </div>
      <div class="block">
        <div class="block-label">Quality Gates</div>
        <p>A Quality Gate is a pass/fail threshold — for example: "code coverage must be above 80%", "zero critical security vulnerabilities". If the gate fails, the pipeline stops. The developer must fix the issues and push again.</p>
      </div>
      <div class="block">
        <div class="block-label">SAST vs DAST</div>
        <p>SonarQube does SAST — Static Application Security Testing — it reads your source code without running it. DAST (Dynamic) tests the running application. Both are needed in a mature pipeline. SonarQube covers SAST in the build phase.</p>
      </div>
    `
  },
  'unit-tests': {
    icon: '✓', iconBg: '#0d1e1a', iconBorder: '#0f6e56',
    title: 'Unit tests',
    subtitle: 'junit / pytest / jasmine',
    color: '#2dd4a0',
    body: `
      <div class="block">
        <div class="block-label">What unit tests do</div>
        <p>Unit tests test individual functions or methods in isolation — no database, no network, no file system. They use mocks/stubs to replace external dependencies. A good unit test runs in milliseconds.</p>
      </div>
      <div class="highlight-box">
        The test pyramid rule: you should have many more unit tests than integration or E2E tests. Unit tests are cheap to write, fast to run, and pinpoint exactly which function broke. Most bugs should be caught here — not in E2E.
      </div>
      <div class="block">
        <div class="block-label">Example — what gets tested</div>
        <div class="mini-flow">
          <div class="flow-step">calculateTax()</div><div class="flow-arrow">→</div>
          <div class="flow-step">returns correct value</div>
        </div>
        <div class="mini-flow" style="margin-top:8px">
          <div class="flow-step">parseDate("bad input")</div><div class="flow-arrow">→</div>
          <div class="flow-step">throws exception</div>
        </div>
      </div>
      <div class="block">
        <div class="block-label">Tools by language</div>
        <div class="tag-row">
          <span class="tag green">JUnit (Java)</span>
          <span class="tag green">pytest (Python)</span>
          <span class="tag green">Jasmine (JS)</span>
          <span class="tag green">Go test (Go)</span>
          <span class="tag green">RSpec (Ruby)</span>
        </div>
      </div>
    `
  },
  'integration-tests': {
    icon: '⟳', iconBg: '#0d1e1a', iconBorder: '#0f6e56',
    title: 'Integration tests',
    subtitle: 'testcontainers / api testing',
    color: '#2dd4a0',
    body: `
      <div class="block">
        <div class="block-label">What integration tests do</div>
        <p>Integration tests check that multiple components work together correctly — your code + the real database, your service + a real message queue, your API + a real third-party endpoint. They use real infrastructure, not mocks.</p>
      </div>
      <div class="highlight-box warn">
        Integration tests are slower than unit tests and harder to set up, but they catch a different class of bug — things that work perfectly in isolation but fail when connected. A function that returns the right value but writes it to the wrong DB table will pass unit tests and fail here.
      </div>
      <div class="block">
        <div class="block-label">Testcontainers — the modern approach</div>
        <p>Testcontainers spins up real Docker containers (PostgreSQL, Redis, Kafka) for the duration of the test, then destroys them. You get a real database in your CI pipeline without maintaining a persistent test DB server.</p>
      </div>
      <div class="block">
        <div class="block-label">Example scenarios</div>
        <div class="mini-flow">
          <div class="flow-step">POST /user</div><div class="flow-arrow">→</div>
          <div class="flow-step">check DB row created</div>
        </div>
        <div class="mini-flow" style="margin-top:8px">
          <div class="flow-step">publish event</div><div class="flow-arrow">→</div>
          <div class="flow-step">consumer processes it</div>
        </div>
      </div>
    `
  },
  'e2e-tests': {
    icon: '⎋', iconBg: '#0d1e1a', iconBorder: '#0f6e56',
    title: 'End-to-end (E2E) tests',
    subtitle: 'cypress / selenium / playwright',
    color: '#2dd4a0',
    body: `
      <div class="block">
        <div class="block-label">What E2E tests do</div>
        <p>E2E tests control a real browser (or HTTP client) and simulate complete user journeys against a fully deployed application — login, navigate, submit, verify. They test the entire stack working together.</p>
      </div>
      <div class="highlight-box danger">
        Uncomfortable truth: if E2E tests are catching bugs that unit tests missed, your unit tests have already failed their job. E2E tests are a confidence check on deployment — not a bug detection layer. Keep the suite to 10–20 critical paths maximum.
      </div>
      <div class="block">
        <div class="block-label">Example journey test</div>
        <div class="mini-flow">
          <div class="flow-step">open browser</div><div class="flow-arrow">→</div>
          <div class="flow-step">login</div><div class="flow-arrow">→</div>
          <div class="flow-step">search product</div><div class="flow-arrow">→</div>
          <div class="flow-step">checkout</div><div class="flow-arrow">→</div>
          <div class="flow-step">confirm order</div>
        </div>
      </div>
      <div class="block">
        <div class="block-label">Tool comparison</div>
        <table class="compare">
          <tr><th>Cypress</th><th>Selenium</th><th>Playwright</th></tr>
          <tr><td>Runs in browser</td><td>WebDriver protocol</td><td>Multi-browser</td></tr>
          <tr><td>Best DX</td><td>Most widely supported</td><td>Best for multi-tab</td></tr>
          <tr><td>JS/TS only</td><td>Any language</td><td>JS/Python/Java/C#</td></tr>
        </table>
      </div>
    `
  },
  'artifact': {
    icon: '📦', iconBg: '#0c1722', iconBorder: '#185fa5',
    title: 'Artifact store',
    subtitle: 'nexus / jfrog / docker registry',
    color: '#4fa3e8',
    body: `
      <div class="block">
        <div class="block-label">What an artifact store is</div>
        <p>After tests pass, Maven packages the code into an immutable versioned artifact — a <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">.jar</code>, <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">.war</code>, or Docker image. That artifact is stored in Nexus/JFrog/registry and never rebuilt again. Every environment (staging, production) pulls this exact same binary.</p>
      </div>
      <div class="highlight-box">
        Critical rule: never rebuild from source code for production deployment. The artifact store is the single binary that was tested. Rebuilding introduces a new variable — "what if the build environment changed between test and prod?"
      </div>
      <div class="block">
        <div class="block-label">The CI/CD split — this is the pivot point</div>
        <p>Everything before the artifact store is <strong style="color:#4fa3e8">CI</strong> (Continuous Integration). Everything after is <strong style="color:#4cde8a">CD</strong> (Continuous Delivery). The artifact store is where integration ends and delivery begins.</p>
      </div>
      <div class="block">
        <div class="block-label">Versioning strategy</div>
        <div class="mini-flow">
          <div class="flow-step">myapp:1.4.2</div><div class="flow-arrow">→</div>
          <div class="flow-step">semantic version</div>
        </div>
        <div class="mini-flow" style="margin-top:8px">
          <div class="flow-step">myapp:abc1234</div><div class="flow-arrow">→</div>
          <div class="flow-step">git SHA tag</div>
        </div>
      </div>
    `
  },
  'dev-env': {
    icon: '🧪', iconBg: '#0d1a0d', iconBorder: '#3b6d11',
    title: 'Dev / QA environment',
    subtitle: 'first automated deployment target',
    color: '#4cde8a',
    body: `
      <div class="block">
        <div class="block-label">What happens here</div>
        <p>Every merge to the develop branch automatically deploys the artifact to the Dev/QA environment. No manual step. This is where developers verify their feature works end-to-end, and where QA engineers run exploratory testing.</p>
      </div>
      <div class="highlight-box">
        Dev environment is cheap and disposable. It can be broken. That's the point — break it here, not in production. It should be as close to production as possible in architecture, but sized down (smaller machines, less replicas).
      </div>
      <div class="block">
        <div class="block-label">Smoke tests run automatically</div>
        <p>After deployment, a set of lightweight smoke tests verify the application started correctly — health endpoint returns 200, login page loads, DB connection is live. If smoke tests fail, alert the developer immediately.</p>
      </div>
    `
  },
  'staging': {
    icon: '⬡', iconBg: '#0d1a0d', iconBorder: '#3b6d11',
    title: 'Staging environment',
    subtitle: 'production mirror — UAT happens here',
    color: '#4cde8a',
    body: `
      <div class="block">
        <div class="block-label">What staging is for</div>
        <p>Staging is as close to production as you can get — same infrastructure size, same config, same secrets (with test values), same data volumes (usually anonymized prod data). UAT (User Acceptance Testing) happens here before anything goes to prod.</p>
      </div>
      <div class="highlight-box danger">
        If staging differs significantly from production, staging is useless. A bug that only appears due to prod-scale traffic or prod-specific config will slip straight through to users. Invest in keeping staging accurate.
      </div>
      <div class="block">
        <div class="block-label">What gets validated in staging</div>
        <div class="tag-row">
          <span class="tag green">Performance under load</span>
          <span class="tag green">Database migrations</span>
          <span class="tag green">Third-party integrations</span>
          <span class="tag green">User acceptance</span>
          <span class="tag green">Security scans</span>
        </div>
      </div>
      <div class="block">
        <div class="block-label">Promotion to production</div>
        <p>Staging doesn't auto-deploy to production. Passing staging is what qualifies the artifact for the manual approval gate. The product owner or team lead reviews staging results and clicks approve.</p>
      </div>
    `
  },
  'manual-gate': {
    icon: '🔒', iconBg: '#1e1410', iconBorder: '#993c1d',
    title: 'Manual approval gate',
    subtitle: 'the human checkpoint before prod',
    color: '#ff7559',
    body: `
      <div class="block">
        <div class="block-label">Why this exists</div>
        <p>The manual gate is the last human checkpoint before code reaches real users. Even in highly automated pipelines, most teams want a human to look at staging results and consciously decide "yes, ship this." It's accountability, not inefficiency.</p>
      </div>
      <div class="highlight-box warn">
        Teams that skip the manual gate for speed end up adding it back after their first bad production incident. The gate takes 30 seconds to approve. A prod outage takes hours to recover from.
      </div>
      <div class="block">
        <div class="block-label">What the approver checks</div>
        <div class="tag-row">
          <span class="tag amber">Staging tests passed</span>
          <span class="tag amber">No open critical bugs</span>
          <span class="tag amber">Right time to deploy</span>
          <span class="tag amber">On-call team is ready</span>
        </div>
      </div>
      <div class="block">
        <div class="block-label">Fully automated pipelines (Continuous Deployment)</div>
        <p>Some teams remove this gate entirely — every staging-passing artifact auto-deploys to prod. This is Continuous Deployment (not just Delivery). It requires very high confidence in test coverage and fast rollback capability. Not appropriate for most teams starting out.</p>
      </div>
    `
  },
  'production': {
    icon: '🚀', iconBg: '#1e0d0d', iconBorder: '#a32d2d',
    title: 'Production',
    subtitle: 'kubernetes / ansible — real users, real stakes',
    color: '#ff5f5f',
    body: `
      <div class="block">
        <div class="block-label">What deploys to production</div>
        <p>The exact same artifact that passed all tests and staging. Kubernetes pulls the Docker image by its immutable SHA tag. Ansible applies the configuration. No code is compiled here — only artifacts are deployed.</p>
      </div>
      <div class="block">
        <div class="block-label">Kubernetes vs Ansible</div>
        <table class="compare">
          <tr><th>Kubernetes</th><th>Ansible</th></tr>
          <tr><td>Container orchestration</td><td>Configuration management</td></tr>
          <tr><td>Manages pods/services</td><td>Manages servers/packages</td></tr>
          <tr><td>Self-healing, auto-scaling</td><td>Idempotent playbooks</td></tr>
          <tr><td>Cloud-native apps</td><td>Traditional VM deployments</td></tr>
        </table>
      </div>
      <div class="highlight-box danger">
        If something goes wrong in production, the first action is rollback — not a fix. Roll back to the last known-good artifact (one git revert and redeploy), then investigate why the new version failed. Don't try to fix forward under pressure.
      </div>
      <div class="block">
        <div class="block-label">Deployment strategies</div>
        <div class="tag-row">
          <span class="tag red">Rolling update</span>
          <span class="tag red">Blue-green</span>
          <span class="tag red">Canary (% of traffic)</span>
          <span class="tag red">Feature flags</span>
        </div>
      </div>
    `
  },
  'monitoring': {
    icon: '📊', iconBg: '#1a1d25', iconBorder: '#3a3d4a',
    title: 'Monitoring & observability',
    subtitle: 'prometheus · grafana · elk · datadog · pagerduty',
    color: '#e8eaf0',
    body: `
      <div class="block">
        <div class="block-label">Monitoring vs Observability — the difference</div>
        <p>Monitoring tells you <em>when</em> something is wrong (alert fires). Observability tells you <em>why</em> it's wrong (logs, traces, metrics let you diagnose). You need both.</p>
      </div>
      <div class="block">
        <div class="block-label">The three pillars</div>
        <div class="tag-row">
          <span class="tag blue">Metrics (Prometheus)</span>
          <span class="tag blue">Logs (ELK / Loki)</span>
          <span class="tag blue">Traces (Jaeger / Tempo)</span>
        </div>
      </div>
      <div class="block">
        <div class="block-label">Tool stack breakdown</div>
        <table class="compare">
          <tr><th>Tool</th><th>Role</th></tr>
          <tr><td>Prometheus</td><td>Scrapes metrics from services every 15s</td></tr>
          <tr><td>Grafana</td><td>Dashboards and alerting on Prometheus data</td></tr>
          <tr><td>ELK Stack</td><td>Elasticsearch + Logstash + Kibana — log aggregation</td></tr>
          <tr><td>Datadog</td><td>Managed SaaS — metrics + logs + traces in one</td></tr>
          <tr><td>PagerDuty</td><td>On-call alerting — wakes someone up at 3am</td></tr>
        </table>
      </div>
      <div class="highlight-box">
        The feedback loop: monitoring data feeds back to developers. A spike in 500 errors after a deploy means the team reverts immediately. This is why monitoring is drawn at the bottom feeding back to the top — it closes the DevOps loop.
      </div>
    `
  },
  'gitops': {
    icon: '∞', iconBg: '#1d1a2e', iconBorder: '#534ab7',
    title: 'GitOps',
    subtitle: 'argocd / flux — git as the operating model',
    color: '#a09aff',
    body: `
      <div class="block">
        <div class="block-label">IaC vs GitOps — the key distinction</div>
        <p>IaC is the <em>what</em> — Terraform, Ansible, Kubernetes YAML files describing desired state. GitOps is the <em>how you operate it</em> — Git is the only mechanism by which that IaC ever gets applied. Nobody runs <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">kubectl apply</code> or <code style="font-family:JetBrains Mono;background:#1a1d25;padding:2px 6px;border-radius:4px;font-size:13px">terraform apply</code> manually.</p>
      </div>
      <div class="highlight-box danger">
        Most teams that claim to "do GitOps" are actually just storing Terraform in Git and running it manually from a pipeline. That's IaC with version control — not GitOps. The difference is the reconciliation loop.
      </div>
      <div class="block">
        <div class="block-label">The 4 GitOps principles</div>
        <div class="tag-row">
          <span class="tag purple">1. Declarative</span>
          <span class="tag purple">2. Versioned</span>
          <span class="tag teal">3. Pulled</span>
          <span class="tag teal">4. Continuously reconciled</span>
        </div>
        <p style="margin-top:12px;font-size:14px;line-height:1.6;color:#c8cad4"><strong style="color:#a09aff">Pulled</strong> = ArgoCD agent <em>inside</em> the cluster polls Git. Your CI server never needs cluster credentials. This is the security win — a compromised Jenkins can't touch prod directly.</p>
      </div>
      <div class="block">
        <div class="block-label">Drift detection — GitOps killer feature</div>
        <p>Someone accidentally deletes a Kubernetes pod manually? ArgoCD detects the live state has drifted from Git's declared state and automatically recreates it. Git always wins. Your cluster self-heals to match the repo.</p>
      </div>
      <div class="block">
        <div class="block-label">Tools</div>
        <table class="compare">
          <tr><th>ArgoCD</th><th>Flux CD</th></tr>
          <tr><td>GUI dashboard</td><td>CLI-first, lightweight</td></tr>
          <tr><td>Multi-cluster support</td><td>Simpler to get started</td></tr>
          <tr><td>CNCF graduated</td><td>CNCF graduated</td></tr>
        </table>
      </div>
    `
  }
};

const STYLES = `
  .page-container {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
    color: #e8eaf0;
  }
  
  .hint {
    padding: 12px 16px;
    font-size: 13px;
    font-family: 'JetBrains Mono', monospace;
    color: #7a7d8a;
    background: #111318;
    border: 1px solid #2a2d38;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .hint b { color: #2dd4a0; }

  .node-group {
    cursor: pointer;
  }
  .node-group rect, .node-group circle {
    transition: filter 0.15s ease, stroke 0.15s ease;
  }
  .node-group:hover rect, .node-group:hover circle {
    filter: brightness(1.3);
    stroke-width: 1.5;
  }
  .node-group:active rect, .node-group:active circle {
    filter: brightness(1.6);
  }

  .canvas-wrapper {
    overflow-x: auto;
    background: #0a0c10;
    border-radius: 12px;
    border: 1px solid #2a2d38;
    padding: 40px 24px;
  }

  .canvas-wrapper svg {
    display: block;
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  }

  .sheet-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 1000;
    backdrop-filter: blur(3px);
  }

  .sheet-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #111318;
    border-top: 1px solid #3a3d4a;
    border-radius: 20px 20px 0 0;
    z-index: 1001;
    max-height: 85vh;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 24px);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform: translateY(100%);
  }
  
  .sheet-container.open {
    transform: translateY(0);
  }

  .sheet-handle {
    width: 40px; height: 4px;
    background: #3a3d4a;
    border-radius: 2px;
    margin: 14px auto 0;
  }

  .sheet-header {
    padding: 20px 28px 16px;
    border-bottom: 1px solid #2a2d38;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  
  .sheet-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .sheet-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  
  .sheet-subtitle {
    font-size: 12px;
    color: #7a7d8a;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 2px;
  }
  
  .sheet-close {
    margin-left: auto;
    background: #1a1d25;
    border: 1px solid #2a2d38;
    color: #7a7d8a;
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  
  .sheet-close:hover {
    background: #2a2d38;
    color: #e8eaf0;
  }

  .sheet-body {
    padding: 24px 28px;
  }
  
  .sheet-body .block {
    margin-bottom: 24px;
  }
  .sheet-body .block-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: #7a7d8a;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .sheet-body p {
    font-size: 15px;
    line-height: 1.7;
    color: #c8cad4;
  }
  .sheet-body p + p { margin-top: 10px; }
  
  .sheet-body .highlight-box {
    background: #1a1d25;
    border: 1px solid #2a2d38;
    border-left: 3px solid #2dd4a0;
    border-radius: 0 8px 8px 0;
    padding: 14px 16px;
    margin: 16px 0;
    font-size: 14px;
    line-height: 1.6;
    color: #c8cad4;
  }
  
  .sheet-body .highlight-box.warn { border-left-color: #f5a623; }
  .sheet-body .highlight-box.danger { border-left-color: #ff5f5f; }
  .sheet-body .highlight-box.info { border-left-color: #4fa3e8; }
  .sheet-body .highlight-box.purple { border-left-color: #7c6fff; }
  
  .sheet-body .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  .sheet-body .tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid;
  }
  
  .sheet-body .tag.purple { color: #7c6fff; border-color: #7c6fff44; background: #7c6fff11; }
  .sheet-body .tag.teal { color: #2dd4a0; border-color: #2dd4a044; background: #2dd4a011; }
  .sheet-body .tag.amber { color: #f5a623; border-color: #f5a62344; background: #f5a62311; }
  .sheet-body .tag.red { color: #ff5f5f; border-color: #ff5f5f44; background: #ff5f5f11; }
  .sheet-body .tag.green { color: #4cde8a; border-color: #4cde8a44; background: #4cde8a11; }
  .sheet-body .tag.blue { color: #4fa3e8; border-color: #4fa3e844; background: #4fa3e811; }
  
  .sheet-body .mini-flow {
    display: flex;
    align-items: center;
    gap: 0;
    flex-wrap: wrap;
    margin: 14px 0;
    row-gap: 8px;
  }
  
  .sheet-body .mini-flow .flow-step {
    background: #1a1d25;
    border: 1px solid #2a2d38;
    border-radius: 6px;
    padding: 7px 14px;
    font-size: 13px;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
  }
  .sheet-body .mini-flow .flow-arrow {
    color: #7a7d8a;
    padding: 0 6px;
    font-size: 14px;
  }

  .sheet-body .compare {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin: 14px 0;
  }
  
  .sheet-body .compare th {
    text-align: left;
    padding: 8px 12px;
    background: #1a1d25;
    border: 1px solid #2a2d38;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #7a7d8a;
    letter-spacing: 0.06em;
  }
  .sheet-body .compare td {
    padding: 10px 12px;
    border: 1px solid #2a2d38;
    color: #c8cad4;
    vertical-align: top;
    line-height: 1.5;
  }
  .sheet-body .compare tr:nth-child(even) td { background: #1a1d25; }
`;

export const PipelineReferenceView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const selectedData = activeNode ? PIPELINE_DATA[activeNode] : null;

  return (
    <div className="page-container">
      <style>{STYLES}</style>
      <div className="hint">
        <span>💡</span> <b>Tap any node</b> in the diagram to open a detailed explanation with examples
      </div>

      <div className="canvas-wrapper">
        <svg className="pipeline-svg" viewBox="0 0 740 860" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#3a3d4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="arr-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#2dd4a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#ff5f5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>

          {/* Phase labels */}
          <text x="30" y="88" fontFamily="JetBrains Mono" fontSize="10" fill="#4a4d5a" transform="rotate(-90,30,88)">SOURCE</text>
          <text x="30" y="248" fontFamily="JetBrains Mono" fontSize="10" fill="#4a4d5a" transform="rotate(-90,30,248)">BUILD</text>
          <text x="30" y="430" fontFamily="JetBrains Mono" fontSize="10" fill="#4a4d5a" transform="rotate(-90,30,430)">TEST</text>
          <text x="30" y="574" fontFamily="JetBrains Mono" fontSize="10" fill="#4a4d5a" transform="rotate(-90,30,574)">ARTIFACT</text>
          <text x="30" y="704" fontFamily="JetBrains Mono" fontSize="10" fill="#4a4d5a" transform="rotate(-90,30,704)">DEPLOY</text>
          <text x="30" y="804" fontFamily="JetBrains Mono" fontSize="10" fill="#4a4d5a" transform="rotate(-90,30,804)">MONITOR</text>

          {/* Developer */}
          <g className="node-group" onClick={() => setActiveNode('developer')}>
            <rect x="56" y="56" width="150" height="56" rx="8" fill="#1a1d25" stroke="#3a3d4a" strokeWidth="0.5"/>
            <text x="131" y="80" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#e8eaf0" textAnchor="middle" dominantBaseline="central">Developer</text>
            <text x="131" y="99" fontFamily="JetBrains Mono" fontSize="10" fill="#7a7d8a" textAnchor="middle" dominantBaseline="central">Write &amp; commit</text>
          </g>
          
          {/* git push arrow */}
          <line x1="206" y1="84" x2="256" y2="84" stroke="#3a3d4a" strokeWidth="1" markerEnd="url(#arr)"/>
          <text x="231" y="77" fontFamily="JetBrains Mono" fontSize="9" fill="#4a4d5a" textAnchor="middle">git push</text>

          {/* Git */}
          <g className="node-group" onClick={() => setActiveNode('git')}>
            <rect x="256" y="56" width="160" height="56" rx="8" fill="#1d1a2e" stroke="#534ab7" strokeWidth="0.8"/>
            <text x="336" y="80" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#a09aff" textAnchor="middle" dominantBaseline="central">Git</text>
            <text x="336" y="99" fontFamily="JetBrains Mono" fontSize="10" fill="#7a6dcc" textAnchor="middle" dominantBaseline="central">GitHub / GitLab</text>
          </g>
          
          {/* webhook arrow */}
          <line x1="416" y1="84" x2="466" y2="84" stroke="#3a3d4a" strokeWidth="1" markerEnd="url(#arr)"/>
          <text x="441" y="77" fontFamily="JetBrains Mono" fontSize="9" fill="#4a4d5a" textAnchor="middle">webhook</text>

          {/* Jenkins */}
          <g className="node-group" onClick={() => setActiveNode('jenkins')}>
            <rect x="466" y="56" width="222" height="56" rx="8" fill="#201e14" stroke="#854f0b" strokeWidth="0.8"/>
            <text x="577" y="80" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#f5a623" textAnchor="middle" dominantBaseline="central">Jenkins / GH Actions</text>
            <text x="577" y="99" fontFamily="JetBrains Mono" fontSize="10" fill="#8a6020" textAnchor="middle" dominantBaseline="central">CI server, triggers pipeline</text>
          </g>

          <line x1="577" y1="112" x2="577" y2="172" stroke="#3a3d4a" strokeWidth="1" markerEnd="url(#arr)"/>

          {/* Maven */}
          <g className="node-group" onClick={() => setActiveNode('maven')}>
            <rect x="466" y="172" width="222" height="56" rx="8" fill="#201e14" stroke="#854f0b" strokeWidth="0.8"/>
            <text x="577" y="196" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#f5a623" textAnchor="middle" dominantBaseline="central">Maven / Gradle</text>
            <text x="577" y="215" fontFamily="JetBrains Mono" fontSize="10" fill="#8a6020" textAnchor="middle" dominantBaseline="central">Compile, resolve deps</text>
          </g>

          {/* SonarQube */}
          <g className="node-group" onClick={() => setActiveNode('sonarqube')}>
            <rect x="270" y="172" width="160" height="56" rx="8" fill="#1a1d25" stroke="#3a3d4a" strokeWidth="0.5"/>
            <text x="350" y="196" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#e8eaf0" textAnchor="middle" dominantBaseline="central">SonarQube</text>
            <text x="350" y="215" fontFamily="JetBrains Mono" fontSize="10" fill="#7a7d8a" textAnchor="middle" dominantBaseline="central">Code quality, SAST</text>
          </g>
          <path d="M466 200 L440 200" stroke="#3a3d4a" strokeWidth="0.8" strokeDasharray="4 3" markerEnd="url(#arr)" fill="none"/>

          <line x1="577" y1="228" x2="577" y2="300" stroke="#3a3d4a" strokeWidth="1" markerEnd="url(#arr)"/>
          <text x="600" y="267" fontFamily="JetBrains Mono" fontSize="9" fill="#4a4d5a" dominantBaseline="central">build output</text>

          {/* Unit tests */}
          <g className="node-group" onClick={() => setActiveNode('unit-tests')}>
            <rect x="56" y="300" width="148" height="56" rx="8" fill="#0d1e1a" stroke="#0f6e56" strokeWidth="0.8"/>
            <text x="130" y="324" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#2dd4a0" textAnchor="middle" dominantBaseline="central">Unit tests</text>
            <text x="130" y="343" fontFamily="JetBrains Mono" fontSize="10" fill="#1d7060" textAnchor="middle" dominantBaseline="central">JUnit / pytest</text>
          </g>

          {/* Integration tests */}
          <g className="node-group" onClick={() => setActiveNode('integration-tests')}>
            <rect x="222" y="300" width="172" height="56" rx="8" fill="#0d1e1a" stroke="#0f6e56" strokeWidth="0.8"/>
            <text x="308" y="320" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#2dd4a0" textAnchor="middle" dominantBaseline="central">Integration tests</text>
            <text x="308" y="340" fontFamily="JetBrains Mono" fontSize="10" fill="#1d7060" textAnchor="middle" dominantBaseline="central">Testcontainers / API</text>
          </g>

          {/* E2E tests */}
          <g className="node-group" onClick={() => setActiveNode('e2e-tests')}>
            <rect x="412" y="300" width="148" height="56" rx="8" fill="#0d1e1a" stroke="#0f6e56" strokeWidth="0.8"/>
            <text x="486" y="324" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#2dd4a0" textAnchor="middle" dominantBaseline="central">E2E tests</text>
            <text x="486" y="343" fontFamily="JetBrains Mono" fontSize="10" fill="#1d7060" textAnchor="middle" dominantBaseline="central">Cypress / Selenium</text>
          </g>

          <path d="M577 300 L577 328 L544 328" fill="none" stroke="#3a3d4a" strokeWidth="0.8" markerEnd="url(#arr)"/>
          <path d="M577 300 L577 328 L308 328" fill="none" stroke="#3a3d4a" strokeWidth="0.8" markerEnd="url(#arr)"/>
          <path d="M577 300 L577 328 L130 328" fill="none" stroke="#3a3d4a" strokeWidth="0.8" markerEnd="url(#arr)"/>

          <path d="M130 356 L130 394 L50 394 L50 84 L56 84" fill="none" stroke="#ff5f5f" strokeWidth="0.8" strokeDasharray="4 3" markerEnd="url(#arr-red)"/>
          <text x="42" y="228" fontFamily="JetBrains Mono" fontSize="9" fill="#ff5f5f" textAnchor="middle" transform="rotate(-90,42,228)">fail → fix &amp; repush</text>

          <line x1="338" y1="356" x2="338" y2="468" stroke="#3a3d4a" strokeWidth="1" markerEnd="url(#arr)"/>
          <text x="380" y="414" fontFamily="JetBrains Mono" fontSize="9" fill="#4a4d5a" textAnchor="middle" dominantBaseline="central">all tests pass</text>

          {/* Artifact store */}
          <g className="node-group" onClick={() => setActiveNode('artifact')}>
            <rect x="180" y="468" width="316" height="56" rx="8" fill="#0c1722" stroke="#185fa5" strokeWidth="0.8"/>
            <text x="338" y="492" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#4fa3e8" textAnchor="middle" dominantBaseline="central">Artifact store</text>
            <text x="338" y="511" fontFamily="JetBrains Mono" fontSize="10" fill="#2a5e8a" textAnchor="middle" dominantBaseline="central">Nexus / JFrog / Docker Registry</text>
          </g>

          <line x1="338" y1="524" x2="338" y2="600" stroke="#3a3d4a" strokeWidth="1" markerEnd="url(#arr)"/>

          {/* Dev/QA */}
          <g className="node-group" onClick={() => setActiveNode('dev-env')}>
            <rect x="56" y="600" width="148" height="56" rx="8" fill="#0d1a0d" stroke="#3b6d11" strokeWidth="0.8"/>
            <text x="130" y="624" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#4cde8a" textAnchor="middle" dominantBaseline="central">Dev / QA</text>
            <text x="130" y="643" fontFamily="JetBrains Mono" fontSize="10" fill="#2a7a3a" textAnchor="middle" dominantBaseline="central">Auto deploy, smoke</text>
          </g>

          {/* Staging */}
          <g className="node-group" onClick={() => setActiveNode('staging')}>
            <rect x="222" y="600" width="148" height="56" rx="8" fill="#0d1a0d" stroke="#3b6d11" strokeWidth="0.8"/>
            <text x="296" y="624" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#4cde8a" textAnchor="middle" dominantBaseline="central">Staging</text>
            <text x="296" y="643" fontFamily="JetBrains Mono" fontSize="10" fill="#2a7a3a" textAnchor="middle" dominantBaseline="central">Mirror of prod, UAT</text>
          </g>

          {/* Manual gate */}
          <g className="node-group" onClick={() => setActiveNode('manual-gate')}>
            <rect x="388" y="600" width="148" height="56" rx="8" fill="#1e1410" stroke="#993c1d" strokeWidth="0.8"/>
            <text x="462" y="620" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#ff7559" textAnchor="middle" dominantBaseline="central">Manual gate</text>
            <text x="462" y="640" fontFamily="JetBrains Mono" fontSize="10" fill="#7a3a1a" textAnchor="middle" dominantBaseline="central">Approval required</text>
          </g>

          {/* Production */}
          <g className="node-group" onClick={() => setActiveNode('production')}>
            <rect x="554" y="600" width="134" height="56" rx="8" fill="#1e0d0d" stroke="#a32d2d" strokeWidth="0.8"/>
            <text x="621" y="624" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#ff5f5f" textAnchor="middle" dominantBaseline="central">Production</text>
            <text x="621" y="643" fontFamily="JetBrains Mono" fontSize="10" fill="#7a2a2a" textAnchor="middle" dominantBaseline="central">K8s / Ansible</text>
          </g>

          <path d="M338 600 L338 628 L204 628" fill="none" stroke="#3a3d4a" strokeWidth="0.8" markerEnd="url(#arr)"/>
          <path d="M338 600 L338 628 L296 628" fill="none" stroke="#3a3d4a" strokeWidth="0.8" markerEnd="url(#arr)"/>
          
          <line x1="370" y1="628" x2="388" y2="628" stroke="#3a3d4a" strokeWidth="0.8" markerEnd="url(#arr)"/>
          <line x1="536" y1="628" x2="554" y2="628" stroke="#3a3d4a" strokeWidth="0.8" markerEnd="url(#arr)"/>

          <line x1="621" y1="656" x2="621" y2="724" stroke="#3a3d4a" strokeWidth="1" markerEnd="url(#arr)"/>

          {/* Monitoring */}
          <g className="node-group" onClick={() => setActiveNode('monitoring')}>
            <rect x="56" y="724" width="632" height="56" rx="8" fill="#1a1d25" stroke="#3a3d4a" strokeWidth="0.5"/>
            <text x="372" y="748" fontFamily="Syne" fontSize="13" fontWeight="700" fill="#e8eaf0" textAnchor="middle" dominantBaseline="central">Monitoring &amp; observability</text>
            <text x="372" y="767" fontFamily="JetBrains Mono" fontSize="10" fill="#7a7d8a" textAnchor="middle" dominantBaseline="central">Prometheus + Grafana · ELK Stack · Datadog · PagerDuty</text>
          </g>

          <path d="M56 752 L40 752 L40 84 L56 84" fill="none" stroke="#3a3d4a" strokeWidth="0.6" strokeDasharray="3 3" markerEnd="url(#arr)"/>

          {/* GitOps */}
          <g className="node-group" onClick={() => setActiveNode('gitops')}>
            <rect x="56" y="468" width="108" height="56" rx="8" fill="#1d1a2e" stroke="#534ab7" strokeWidth="0.8"/>
            <text x="110" y="492" fontFamily="Syne" fontSize="12" fontWeight="700" fill="#a09aff" textAnchor="middle" dominantBaseline="central">GitOps</text>
            <text x="110" y="511" fontFamily="JetBrains Mono" fontSize="9" fill="#7a6dcc" textAnchor="middle" dominantBaseline="central">ArgoCD / Flux</text>
          </g>
          <path d="M164 496 L180 496" fill="none" stroke="#534ab7" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arr)"/>
        </svg>
      </div>

      {activeNode && selectedData && (
        <>
          <div
            className="sheet-overlay"
            onClick={() => setActiveNode(null)}
          />
          <div className="sheet-container open">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div 
                className="sheet-icon" 
                style={{ background: selectedData.iconBg, border: `1px solid ${selectedData.iconBorder}` }}
              >
                {selectedData.icon}
              </div>
              <div>
                <div className="sheet-title" style={{ color: selectedData.color }}>
                  {selectedData.title}
                </div>
                <div className="sheet-subtitle">
                  {selectedData.subtitle}
                </div>
              </div>
              <div className="sheet-close" onClick={() => setActiveNode(null)}>
                <span style={{ fontSize: '18px' }}>×</span>
              </div>
            </div>
            
            <div 
              className="sheet-body"
              dangerouslySetInnerHTML={{ __html: selectedData.body }} 
            />
          </div>
        </>
      )}
    </div>
  );
};
