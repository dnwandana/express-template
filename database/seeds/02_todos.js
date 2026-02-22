import crypto from "node:crypto"

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async (knex) => {
  if (process.env.NODE_ENV === "production") throw new Error("Seeding is not allowed in production")

  // ── User IDs (must match 01_users.js) ──────────────────────────────
  const USER_IDS = {
    john_doe: "de159aac-67ab-40bf-9234-2b55b10d23db",
    jane_doe: "e92c325c-9522-4f64-8e4d-c568c8323008",
    alex: "19e565d0-8dfb-4f32-a33f-fd61772aaf03",
    cloud: "2bcd8bf1-d4b7-4eaa-88fb-45bc90ad37a1",
    sudo_sam: "ce93fc37-71de-491f-98ea-6485d399370c",
  }

  // ── Per-user themed templates (30 each) ────────────────────────────
  // john.doe — Backend developer: API debugging, dependency management, testing, code review
  const johnDoeTemplates = [
    { title: "Debug slow response on /api/users endpoint", description: "Response times spiking to 3s+ under load. Profile the query plan and check for N+1 issues." },
    { title: "Add request tracing with correlation IDs", description: "Implement distributed tracing headers across all services for better debugging in production." },
    { title: "Migrate from callbacks to async/await in legacy module", description: "The payment processing module still uses callback patterns. Refactor for readability and error handling." },
    { title: "Set up database connection pooling", description: "Current connections are being created per-request. Configure pgBouncer or Knex pool settings properly." },
    { title: "Write integration tests for order processing", description: "Cover the full order lifecycle: create, payment, fulfillment, and cancellation flows." },
    { title: "Implement graceful shutdown handling", description: "Server needs to drain connections and finish in-flight requests before stopping on SIGTERM." },
    { title: "Add structured JSON logging", description: "Replace console.log calls with structured logger. Include request ID, user ID, and operation context." },
    { title: "Review and update error codes documentation", description: "Error responses are inconsistent across endpoints. Standardize codes and document them in the wiki." },
    { title: "Optimize bulk import endpoint", description: "CSV import of 10k+ records is timing out. Implement streaming parser and batch inserts." },
    { title: "Fix race condition in inventory update", description: "Concurrent requests can oversell items. Add optimistic locking or SELECT FOR UPDATE." },
    { title: "Add health check endpoint with dependency status", description: "Include database, Redis, and external API connectivity in the health check response." },
    { title: "Implement API versioning strategy", description: "Plan how to handle breaking changes. Evaluate URL path vs header-based versioning." },
    { title: "Set up load testing with k6", description: "Create load test scripts for critical endpoints. Establish baseline performance metrics." },
    { title: "Refactor middleware chain for auth routes", description: "Auth middleware is duplicated across routes. Extract into composable middleware functions." },
    { title: "Add database query logging for development", description: "Log all SQL queries with execution time in dev mode for easier debugging." },
    { title: "Implement idempotency keys for POST endpoints", description: "Prevent duplicate resource creation from retried requests. Store keys in Redis with TTL." },
    { title: "Fix timezone handling in date filters", description: "API returns different results depending on server timezone. Normalize all dates to UTC." },
    { title: "Add request body size validation", description: "Large payloads are causing memory spikes. Enforce limits and return 413 for oversized requests." },
    { title: "Review npm audit findings", description: "Latest audit shows 3 high severity vulnerabilities. Evaluate impact and update affected packages." },
    { title: "Implement soft delete for user accounts", description: "Instead of hard deleting, mark records with deleted_at timestamp. Update queries to filter." },
    { title: "Add retry logic for external API calls", description: "Third-party payment API has intermittent failures. Implement exponential backoff with jitter." },
    { title: "Create database seed data for QA environment", description: "QA team needs realistic test data. Generate varied records covering edge cases." },
    { title: "Fix memory spike during CSV export", description: "Large exports load everything into memory. Switch to streaming response with cursor-based queries." },
    { title: "Implement rate limiting per API key", description: "Current rate limiter is IP-based. Add per-key limits for authenticated API consumers." },
    { title: "Add OpenTelemetry spans for database operations", description: "Tracing gaps in database layer make it hard to pinpoint slow queries in production." },
    { title: "Refactor validation logic into shared schemas", description: "Same validation rules duplicated across controllers. Extract into reusable Joi schemas." },
    { title: "Debug intermittent test failures in CI", description: "Three tests fail randomly in GitHub Actions but pass locally. Investigate timing and isolation issues." },
    { title: "Implement cursor-based pagination for search API", description: "Offset pagination performs poorly on large result sets. Switch to keyset pagination." },
    { title: "Add circuit breaker for downstream services", description: "When payment service is down, cascading failures take out the entire API. Add circuit breaker pattern." },
    { title: "Document internal API contracts between services", description: "No clear documentation of what each service expects. Create AsyncAPI specs for event contracts." },
  ]

  // jane.doe — Full-stack developer: frontend/backend integration, docs, DevEx tooling
  const janeDoeTemplates = [
    { title: "Build reusable form component with validation", description: "Create a generic form component that handles validation, error display, and submission state." },
    { title: "Implement dark mode toggle with CSS variables", description: "Add system preference detection and manual toggle. Persist preference in localStorage." },
    { title: "Fix hydration mismatch in SSR pages", description: "React hydration warnings on the product listing page. Server and client HTML differ on date formatting." },
    { title: "Set up Storybook for component documentation", description: "Configure Storybook with TypeScript support. Add stories for all shared UI components." },
    { title: "Implement optimistic UI updates for todo actions", description: "Update the UI immediately on action, then reconcile with server response or rollback on error." },
    { title: "Add end-to-end type safety with tRPC", description: "Evaluate replacing REST endpoints with tRPC for automatic type inference from backend to frontend." },
    { title: "Create shared TypeScript types package", description: "Extract API response types into a shared package used by both frontend and backend." },
    { title: "Fix infinite scroll performance issues", description: "List component re-renders all items on new page load. Implement virtualized scrolling." },
    { title: "Set up API mocking for frontend development", description: "Configure MSW (Mock Service Worker) so frontend devs can work independently of backend." },
    { title: "Implement file drag-and-drop upload zone", description: "Add drag-and-drop area with preview thumbnails, progress bars, and retry for failed uploads." },
    { title: "Build notification toast system", description: "Create a toast notification component with auto-dismiss, stacking, and action buttons." },
    { title: "Add keyboard shortcuts for power users", description: "Implement Cmd+K command palette and shortcuts for common actions like navigation and search." },
    { title: "Fix layout shift on image loading", description: "CLS score is poor due to images loading without dimensions. Add aspect ratio containers." },
    { title: "Implement collaborative editing indicators", description: "Show which users are currently viewing or editing the same document in real-time." },
    { title: "Create developer onboarding documentation", description: "Write setup guide covering local environment, database seeding, and common development workflows." },
    { title: "Add accessibility audit to CI pipeline", description: "Integrate axe-core checks into the build. Fail on critical accessibility violations." },
    { title: "Implement search with debounced input", description: "Add search functionality with debounce to avoid excessive API calls while typing." },
    { title: "Fix mobile responsive layout breakpoints", description: "Dashboard sidebar overlaps content on tablet viewports. Adjust breakpoints and add collapsible nav." },
    { title: "Set up visual regression testing", description: "Configure Percy or Chromatic for screenshot comparisons on PR builds." },
    { title: "Build settings page with tabbed navigation", description: "Create user settings page with profile, notifications, security, and API key management tabs." },
    { title: "Implement copy-to-clipboard with feedback", description: "Add click-to-copy on code blocks and API keys with visual confirmation toast." },
    { title: "Add error boundary with fallback UI", description: "Wrap route components in error boundaries that show a friendly message and retry button." },
    { title: "Create changelog page from git tags", description: "Auto-generate a user-facing changelog from semantic release notes and tagged releases." },
    { title: "Implement data export to CSV and JSON", description: "Add export buttons to data tables with column selection and format choice." },
    { title: "Fix state persistence across page refreshes", description: "Form data and filter selections are lost on refresh. Use URL params or sessionStorage." },
    { title: "Build onboarding wizard for new users", description: "Multi-step welcome flow covering profile setup, preferences, and feature tour." },
    { title: "Add loading skeletons for async content", description: "Replace spinners with skeleton screens matching the layout of the content being loaded." },
    { title: "Implement image lazy loading with blur placeholder", description: "Load low-res blurred placeholder first, then swap to full image when in viewport." },
    { title: "Create API playground in documentation", description: "Build an interactive API explorer where developers can test endpoints with their API key." },
    { title: "Set up feature flags for gradual rollout", description: "Integrate LaunchDarkly or similar to control feature visibility per user segment." },
  ]

  // AlexTheBuilder — Frontend/DevOps: React, CI/CD, build tools, testing frameworks
  const alexTemplates = [
    { title: "Configure Vite build optimization", description: "Bundle size is too large. Set up code splitting, tree shaking, and analyze output with rollup-plugin-visualizer." },
    { title: "Set up GitHub Actions matrix for cross-browser testing", description: "Run Playwright tests across Chrome, Firefox, and Safari in parallel CI jobs." },
    { title: "Implement React Server Components migration", description: "Evaluate which components can be server-rendered. Start with data-heavy listing pages." },
    { title: "Create Docker Compose for local development", description: "Single command to spin up API, database, Redis, and mail server for local development." },
    { title: "Fix flaky Cypress tests in CI", description: "E2E tests fail intermittently due to timing issues. Add proper waits and stabilize selectors." },
    { title: "Set up Turborepo for monorepo management", description: "Configure task caching, dependency graph, and remote caching for the monorepo build." },
    { title: "Implement component lazy loading with Suspense", description: "Wrap heavy route components in Suspense boundaries with loading fallbacks." },
    { title: "Configure ESLint flat config migration", description: "Migrate from .eslintrc to new flat config format. Update all plugin configurations." },
    { title: "Build custom webpack plugin for asset versioning", description: "Auto-append content hash to static assets and update service worker cache manifest." },
    { title: "Set up Renovate for automated dependency updates", description: "Configure Renovate bot with grouping rules, auto-merge for patch updates, and schedules." },
    { title: "Implement micro-frontend architecture POC", description: "Evaluate Module Federation for splitting the app into independently deployable frontend modules." },
    { title: "Create reusable GitHub Actions workflow templates", description: "Build shared workflow templates for linting, testing, building, and deploying across repos." },
    { title: "Optimize React re-renders with memo and callbacks", description: "Profile component re-renders in React DevTools. Apply React.memo and useCallback strategically." },
    { title: "Set up Playwright component testing", description: "Configure Playwright's component testing for isolated UI component verification." },
    { title: "Implement preview deployments for PRs", description: "Auto-deploy branch previews to Vercel/Netlify on PR creation for easier review." },
    { title: "Migrate CSS to Tailwind utility classes", description: "Replace custom CSS with Tailwind. Set up custom theme tokens matching the design system." },
    { title: "Configure source maps for production debugging", description: "Upload source maps to Sentry but exclude them from public bundles." },
    { title: "Build CLI tool for scaffolding new components", description: "Create a plop/hygen generator that creates component file, test, and story from template." },
    { title: "Set up Docker layer caching in CI", description: "Optimize Docker build times by properly ordering layers and using BuildKit cache mounts." },
    { title: "Implement A/B testing framework integration", description: "Add Optimizely or GrowthBook SDK with React hooks for feature experiments." },
    { title: "Fix tree shaking for shared utility library", description: "Side effects in utils package prevent dead code elimination. Add sideEffects field to package.json." },
    { title: "Create performance budget monitoring", description: "Set up Lighthouse CI with budgets for bundle size, FCP, LCP, and CLS metrics." },
    { title: "Implement service worker for offline support", description: "Add Workbox-powered service worker with cache-first strategy for static assets." },
    { title: "Set up Changesets for version management", description: "Configure Changesets for automated changelog generation and version bumping in monorepo." },
    { title: "Build animated page transitions", description: "Add Framer Motion route transitions with shared layout animations between pages." },
    { title: "Configure multi-stage Dockerfile for Node app", description: "Separate build and runtime stages. Use distroless base image for smallest possible container." },
    { title: "Set up Vitest for unit testing migration", description: "Migrate from Jest to Vitest for faster test execution and native ESM support." },
    { title: "Implement ISR for product catalog pages", description: "Use Incremental Static Regeneration to serve pre-rendered pages with periodic revalidation." },
    { title: "Create dev container configuration", description: "Set up VS Code devcontainer with all required tools, extensions, and port forwarding." },
    { title: "Build design system tokens pipeline", description: "Transform Figma design tokens to CSS variables, Tailwind config, and TypeScript constants." },
  ]

  // CloudArchitect — Infrastructure: AWS, Kubernetes, networking, security
  const cloudTemplates = [
    { title: "Set up VPC peering between staging and production", description: "Enable secure communication between environments while maintaining network isolation." },
    { title: "Configure Kubernetes horizontal pod autoscaler", description: "Set up HPA based on CPU, memory, and custom metrics from Prometheus." },
    { title: "Implement AWS WAF rules for API protection", description: "Add rate limiting, geo-blocking, and SQL injection protection rules to the WAF." },
    { title: "Design multi-region database replication", description: "Set up PostgreSQL streaming replication across regions for disaster recovery and read scaling." },
    { title: "Create Terraform modules for standard infrastructure", description: "Build reusable modules for VPC, ECS clusters, RDS instances, and S3 buckets." },
    { title: "Set up Vault for secrets management", description: "Deploy HashiCorp Vault with auto-unseal. Migrate hardcoded secrets from environment variables." },
    { title: "Configure CloudFront CDN for static assets", description: "Set up distribution with custom domain, origin access identity, and cache invalidation." },
    { title: "Implement pod security policies in Kubernetes", description: "Enforce security contexts, prevent privilege escalation, and restrict host path mounts." },
    { title: "Set up cross-account IAM roles for CI/CD", description: "Configure assume-role chain so CI can deploy to multiple AWS accounts securely." },
    { title: "Design blue-green deployment strategy", description: "Implement zero-downtime deployments using ALB target group switching." },
    { title: "Configure PagerDuty alerting integration", description: "Set up alert routing, escalation policies, and on-call schedules for production incidents." },
    { title: "Implement network policies in Kubernetes", description: "Restrict pod-to-pod communication. Only allow necessary traffic between namespaces." },
    { title: "Set up AWS Cost Explorer alerts", description: "Configure budgets and anomaly detection to catch unexpected spending spikes early." },
    { title: "Migrate from ECS to EKS", description: "Plan migration of container workloads from ECS to EKS for better portability and tooling." },
    { title: "Configure database automated backups and PITR", description: "Set up Point-in-Time Recovery with cross-region backup replication for RDS instances." },
    { title: "Implement service account rotation for Kubernetes", description: "Automate service account token rotation and integrate with external secrets operator." },
    { title: "Set up GitOps with ArgoCD", description: "Configure ArgoCD for declarative deployments synced from the infrastructure Git repository." },
    { title: "Design API rate limiting at infrastructure level", description: "Implement rate limiting in the API gateway and load balancer layers before reaching application." },
    { title: "Configure VPN access for remote engineers", description: "Set up WireGuard VPN with SSO integration for secure access to internal resources." },
    { title: "Implement container image scanning in CI", description: "Add Trivy or Snyk scanning to detect vulnerabilities in container images before deployment." },
    { title: "Set up centralized DNS management", description: "Migrate DNS to Route53 with IaC. Implement split-horizon for internal vs external resolution." },
    { title: "Configure S3 lifecycle policies for cost optimization", description: "Move infrequently accessed objects to Glacier. Set expiration for temporary uploads." },
    { title: "Implement mutual TLS between services", description: "Set up mTLS using cert-manager in Kubernetes for zero-trust service communication." },
    { title: "Design data pipeline infrastructure", description: "Set up Apache Airflow on Kubernetes for orchestrating ETL jobs and data processing workflows." },
    { title: "Configure AWS CloudTrail for compliance auditing", description: "Enable CloudTrail across all accounts. Set up S3 log storage with integrity validation." },
    { title: "Set up Prometheus and Grafana monitoring stack", description: "Deploy monitoring stack with custom dashboards for application, infrastructure, and business metrics." },
    { title: "Implement spot instance strategy for non-critical workloads", description: "Configure mixed instance policies to reduce EC2 costs by 60-80% for batch processing." },
    { title: "Design multi-tenant infrastructure isolation", description: "Evaluate namespace-based vs cluster-based isolation for SaaS tenant workloads." },
    { title: "Set up AWS Systems Manager for fleet management", description: "Configure SSM for patching, parameter management, and remote command execution." },
    { title: "Implement chaos engineering with Litmus", description: "Set up chaos experiments for pod failures, network latency, and node drains in staging." },
  ]

  // sudo_sam — Architect: system design, documentation, standards, evaluation
  const sudoSamTemplates = [
    { title: "Draft ADR for message queue selection", description: "Compare RabbitMQ, SQS, and Kafka for our event-driven needs. Document decision and rationale." },
    { title: "Create system context diagram for platform", description: "Map all external systems, actors, and integration points in a C4 Level 1 diagram." },
    { title: "Define coding standards for backend services", description: "Document naming conventions, error handling patterns, logging standards, and testing requirements." },
    { title: "Evaluate GraphQL vs REST for mobile API", description: "Benchmark both approaches for the mobile app. Consider bandwidth, caching, and developer experience." },
    { title: "Design event sourcing pattern for order system", description: "Architect event store schema, projection rebuilding, and snapshot strategy for the order domain." },
    { title: "Write RFC for API deprecation process", description: "Define versioning, sunset headers, migration guides, and timeline for retiring API versions." },
    { title: "Create threat model for authentication flow", description: "Identify attack vectors using STRIDE framework. Document mitigations for each threat." },
    { title: "Design CQRS pattern for read-heavy endpoints", description: "Separate command and query paths for the product catalog. Design materialized view refresh." },
    { title: "Evaluate edge computing for latency-sensitive APIs", description: "Assess Cloudflare Workers vs Lambda@Edge for processing requests closer to users." },
    { title: "Define data retention and privacy policies", description: "Document GDPR-compliant data lifecycle management. Define retention periods per data category." },
    { title: "Architect multi-tenant data isolation strategy", description: "Compare schema-per-tenant, row-level security, and database-per-tenant approaches." },
    { title: "Create capacity planning model for Q4 launch", description: "Estimate resource requirements based on projected traffic. Plan scaling thresholds and limits." },
    { title: "Design circuit breaker and bulkhead patterns", description: "Document resilience patterns for inter-service communication. Define fallback behaviors." },
    { title: "Write technical specification for search feature", description: "Evaluate Elasticsearch vs Typesense. Design index schema, query DSL, and relevance tuning." },
    { title: "Review and update incident response runbooks", description: "Ensure runbooks cover all critical failure scenarios. Add decision trees and escalation paths." },
    { title: "Define API design guidelines for the organization", description: "Document REST conventions, pagination, filtering, error formats, and naming standards." },
    { title: "Architect WebSocket gateway for real-time features", description: "Design connection management, room-based subscriptions, and horizontal scaling with Redis pub/sub." },
    { title: "Evaluate database sharding strategies", description: "Compare hash-based vs range-based sharding for the growing analytics dataset." },
    { title: "Create technology radar for team adoption", description: "Categorize technologies into adopt, trial, assess, and hold based on team experience and goals." },
    { title: "Design idempotent webhook delivery system", description: "Architect reliable webhook dispatch with retry, deduplication, and delivery status tracking." },
    { title: "Write post-mortem template and process guide", description: "Create blameless post-mortem template with timeline, root cause analysis, and action items." },
    { title: "Evaluate serverless vs container orchestration", description: "Compare cost, cold start latency, and operational overhead for our workload patterns." },
    { title: "Design feature flag architecture", description: "Architect a feature flag system supporting gradual rollouts, A/B tests, and user targeting." },
    { title: "Create data flow diagrams for PII handling", description: "Map where personal data enters, transforms, stores, and exits the system for compliance." },
    { title: "Define observability strategy across services", description: "Standardize metrics, traces, and logs. Define SLIs and alerting thresholds per service." },
    { title: "Architect plugin system for extensibility", description: "Design hook points, plugin lifecycle, dependency resolution, and sandboxing for third-party plugins." },
    { title: "Evaluate zero-trust network architecture", description: "Assess moving from perimeter security to zero-trust. Plan identity verification at every layer." },
    { title: "Design batch processing framework", description: "Architect job scheduling, parallel execution, checkpointing, and failure recovery for data pipelines." },
    { title: "Write security architecture review checklist", description: "Create checklist covering authentication, authorization, encryption, input validation, and audit logging." },
    { title: "Define API rate limiting tiers and pricing model", description: "Design usage tiers for the public API with rate limits, quotas, and overage handling." },
  ]

  // ── Generator function ─────────────────────────────────────────────
  function generateTodos(userId, templates, count) {
    const generated = []
    const baseDate = new Date("2025-02-01T09:00:00.000Z")

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length]
      const variant = Math.floor(i / templates.length) + 1
      const title = variant > 1 ? `${template.title} (v${variant})` : template.title
      const createdAt = new Date(baseDate.getTime() + i * 3600000) // 1 hour apart
      const isCompleted = i % 5 < 2 // ~40% completed

      generated.push({
        id: crypto.randomUUID(),
        user_id: userId,
        title,
        description: template.description,
        is_completed: isCompleted,
        created_at: createdAt.toISOString(),
        updated_at: isCompleted
          ? new Date(createdAt.getTime() + 86400000).toISOString()
          : createdAt.toISOString(),
      })
    }
    return generated
  }

  // ── Generate all todos (150 per user, 750 total) ────────────────────
  const allTodos = [
    ...generateTodos(USER_IDS.john_doe, johnDoeTemplates, 150),
    ...generateTodos(USER_IDS.jane_doe, janeDoeTemplates, 150),
    ...generateTodos(USER_IDS.alex, alexTemplates, 150),
    ...generateTodos(USER_IDS.cloud, cloudTemplates, 150),
    ...generateTodos(USER_IDS.sudo_sam, sudoSamTemplates, 150),
  ]

  // ── Insert in batches ──────────────────────────────────────────────
  await knex("todos").del()

  for (let i = 0; i < allTodos.length; i += 100) {
    await knex("todos").insert(allTodos.slice(i, i + 100))
  }
}
