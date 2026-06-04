import React from 'react';
import DocSection from './DocSection';
import DocCallout from './DocCallout';
import DocTable from './DocTable';

export default function SecurityDocsSectionsB() {
  return (
    <>
      <DocSection id="backend" eyebrow="07 — Application Security" title="Server-side enforcement">
        <p>Sensitive operations run server-side and enforce security in code, not just in the UI:</p>
        <ul>
          <li><strong>Authentication checks</strong> — every privileged endpoint verifies the caller and rejects unauthenticated requests with a 401.</li>
          <li><strong>Role gates</strong> — administrative operations (model retraining, system audits, financial approvals) verify the caller's role and return 403 otherwise.</li>
          <li><strong>Least-privilege elevation</strong> — elevated service-role access is requested explicitly per operation, never granted by default.</li>
          <li><strong>Parameterised queries</strong> — the data layer prevents injection attacks by construction.</li>
        </ul>
        <h3>Secrets management</h3>
        <ul>
          <li>API keys and credentials live in an <strong>encrypted secrets vault</strong>, never in source code.</li>
          <li>Secrets are injected at runtime and never exposed to the browser.</li>
          <li>Rotating a secret automatically redeploys dependent functions with zero downtime.</li>
        </ul>
      </DocSection>

      <DocSection id="audit" eyebrow="08 — Audit Logging" title="Comprehensive, immutable audit trail">
        <p>
          Every sensitive action is recorded to an append-only audit log, available
          to administrators for forensic investigation and compliance reporting.
        </p>
        <DocTable
          headers={['Field', 'Purpose']}
          rows={[
            ['Actor email & role', 'Who performed the action and their privilege level'],
            ['Action', 'Specific operation (e.g. data.import, savings.verify)'],
            ['Target entity & ID', 'Exactly which record was affected'],
            ['Summary & metadata', 'Human-readable description plus before/after context'],
            ['Severity & outcome', 'info → critical; success, failure or denied'],
            ['IP hint & user agent', 'Origin and device for anomaly detection'],
            ['Timestamp (UTC)', 'When the action occurred'],
          ]}
        />
        <DocCallout tone="info" title="Categories captured">
          Security, Data, AI, Admin, Financial and System events are all logged —
          covering logins, role changes, imports/exports, model retraining,
          financial approvals and configuration changes.
        </DocCallout>
        <p>
          Logs are <strong>append-only</strong> (users cannot edit or delete them),
          restricted to administrators, and — on enterprise tiers — streamable into
          external SIEM tooling such as Splunk or Datadog.
        </p>
      </DocSection>

      <DocSection id="rbac" eyebrow="09 — Access Control" title="Role-based access control">
        <p>Access is governed by configurable roles, with every sensitive operation checking the caller's role before proceeding.</p>
        <DocTable
          headers={['Role', 'Typical scope']}
          rows={[
            ['Admin', 'Full access, audit-log review, financial approvals'],
            ['Manager', 'Team oversight and approval gates'],
            ['Operator', 'Day-to-day maintenance and inspections'],
            ['Auditor', 'Read-only access for compliance reviews'],
            ['Viewer', 'Dashboards and reporting only'],
          ]}
        />
        <p>Roles are fully customisable per deployment and managed by administrators.</p>
      </DocSection>

      <DocSection id="residency" eyebrow="10 — Data Residency" title="Data residency & sovereignty">
        <ul>
          <li><strong>Default:</strong> United States data centres.</li>
          <li><strong>Enterprise tiers:</strong> EU or UK clusters for data-localisation requirements.</li>
          <li>Suitable for organisations subject to GDPR, UK GDPR and regional data-sovereignty mandates.</li>
        </ul>
      </DocSection>

      <DocSection id="threats" eyebrow="11 — Threat Model" title="Threat mitigation matrix">
        <DocTable
          headers={['Threat', 'Mitigation']}
          rows={[
            ['Cross-tenant data leakage', 'Single-tenant dedicated databases — isolation by infrastructure'],
            ['Privilege escalation', 'Role checks on every operation; least-privilege elevation'],
            ['Credential compromise', 'MFA, SSO and immediate session revocation on logout'],
            ['Injection attacks', 'Parameterised queries and platform-enforced validation'],
            ['Unauthorised file access', 'Signed, time-limited URLs + TLS'],
            ['Audit tampering', 'Append-only logs, admin-only read'],
            ['Data-at-rest exposure', 'AES-256 database encryption'],
            ['Denial of service', 'Gateway and function-level rate limiting'],
          ]}
        />
      </DocSection>

      <DocSection id="compliance" eyebrow="12 — Governance" title="Compliance & governance">
        <DocTable
          headers={['Framework', 'Coverage']}
          rows={[
            ['GDPR / UK GDPR', 'DPA available, deletion workflows, data-residency options'],
            ['CCPA', 'Personal-data tracking and deletion compliance'],
            ['SOC 2 Type II', 'Security, availability, integrity, confidentiality, privacy'],
            ['ISO 27001', 'Audited information-security management system'],
            ['PCI DSS', 'Certified payment processing'],
            ['Sector standards', 'Configurable to facility-management and infrastructure compliance regimes'],
          ]}
        />
        <DocCallout tone="success" title="For procurement & security review">
          A Data Processing Agreement, SOC 2 Type II report and ISO 27001
          certificate are available on request. Contact us to begin a formal
          security review.
        </DocCallout>
      </DocSection>
    </>
  );
}