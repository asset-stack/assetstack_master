import React from 'react';
import DocSection from './DocSection';
import DocCallout from './DocCallout';
import DocTable from './DocTable';

export default function SecurityDocsSectionsA() {
  return (
    <>
      <DocSection id="overview" eyebrow="01 — Overview" title="Executive summary">
        <p>
          AssetStack is an enterprise asset-management platform engineered for
          organisations with strict security obligations — government agencies,
          utilities and critical-infrastructure operators. The platform combines
          independently audited infrastructure with a single-tenant deployment
          model so that each customer's asset, facility and financial data is
          fully isolated, encrypted and auditable.
        </p>
        <DocCallout tone="success" title="At a glance">
          SOC 2 Type II and ISO 27001 audited infrastructure · AES-256 encryption
          at rest · TLS in transit · single-tenant database isolation · OAuth 2.0
          + MFA + SSO · row- and field-level access control · immutable audit logs.
        </DocCallout>
      </DocSection>

      <DocSection id="certifications" eyebrow="02 — Certifications" title="Independent certifications & compliance">
        <p>
          The underlying infrastructure is certified and audited by independent
          third parties. Reports are available to enterprise prospects under NDA.
        </p>
        <DocTable
          headers={['Standard', 'Status', 'What it covers']}
          rows={[
            ['SOC 2 Type II', 'Certified', 'Independently audited controls for security, availability, processing integrity, confidentiality and privacy. Full report available under NDA.'],
            ['ISO 27001', 'Certified', 'A repeatable, audited information-security management system spanning people, processes and technology.'],
            ['GDPR', 'Compliant', 'Data Processing Agreement available; deletion workflows; EU/UK data-residency options.'],
            ['PCI DSS', 'Certified', 'Payment processing handled by a PCI DSS-certified system — no card data ever touches application code.'],
          ]}
        />
      </DocSection>

      <DocSection id="encryption" eyebrow="03 — Encryption" title="Encryption in transit & at rest">
        <h3>In transit</h3>
        <ul>
          <li><strong>TLS encryption</strong> on all API calls and data transfers, enforced at the gateway.</li>
          <li>Modern cipher suites protect against interception and downgrade attacks.</li>
        </ul>
        <h3>At rest</h3>
        <ul>
          <li>All data tables are encrypted with <strong>AES-256</strong> or equivalent.</li>
          <li>Encryption keys are managed by a dedicated key-management service.</li>
          <li>Uploaded files are served through signed, time-limited URLs.</li>
        </ul>
        <DocCallout tone="info" title="Transparency note">
          Data is encrypted but not end-to-end encrypted — platform operators can
          access data when required for support, backup, recovery or lawful
          compliance. This is a deliberate, industry-standard trade-off that
          enables disaster recovery and audit support.
        </DocCallout>
      </DocSection>

      <DocSection id="authentication" eyebrow="04 — Authentication" title="Authentication & access">
        <h3>Standards-based authentication</h3>
        <ul>
          <li><strong>OAuth 2.0</strong> — the same protocol trusted by Google, Microsoft and Apple.</li>
          <li><strong>Signed, time-limited tokens</strong> validated server-side; logout revokes the session immediately.</li>
        </ul>
        <h3>Multi-factor authentication (MFA)</h3>
        <ul>
          <li>Authenticator-app (TOTP) or SMS second factor available for all accounts.</li>
          <li>Protects against credential theft and phishing.</li>
        </ul>
        <h3>Enterprise single sign-on (SSO)</h3>
        <ul>
          <li>OIDC integration with corporate identity providers — <strong>Okta, Azure AD, GitHub</strong> and any OIDC-compliant IdP.</li>
          <li>Centralised identity, group-based access and automated de-provisioning.</li>
        </ul>
      </DocSection>

      <DocSection id="isolation" eyebrow="05 — Data Isolation" title="Single-tenant data isolation">
        <p>
          Every customer runs on a <strong>dedicated application instance</strong>{' '}
          with its own isolated database and unique application identifier. There
          is no shared multi-tenant database, and therefore no class of
          cross-tenant data-leakage vulnerabilities.
        </p>
        <ul>
          <li>Each instance is provisioned from a master template; <strong>no customer data is ever copied</strong> during provisioning.</li>
          <li>One instance physically cannot read or write another instance's data.</li>
          <li>Isolation is guaranteed by infrastructure, not only by application logic.</li>
        </ul>
        <DocCallout tone="success" title="Why this matters for auditors">
          Dedicated-instance isolation removes an entire category of risk that
          multi-tenant SaaS platforms must continuously defend against.
        </DocCallout>
      </DocSection>

      <DocSection id="rls" eyebrow="06 — Data-Level Security" title="Row-level & field-level security">
        <h3>Row-level security (RLS)</h3>
        <p>Controls which <strong>records</strong> each user can read, create, update or delete based on identity and role.</p>
        <h3>Field-level security (FLS)</h3>
        <p>Controls which <strong>fields</strong> within a record a user can read or write — e.g. internal cost projections and assessment notes can be restricted to administrators.</p>
        <DocTable
          headers={['Rule', 'Effect']}
          rows={[
            ['Allow all', 'Open to every authenticated user'],
            ['Block all', 'No user access'],
            ['Creator-only', 'Only the record creator can access'],
            ['Role condition', 'Restricted to specific roles (e.g. admin)'],
            ['Complex AND/OR', 'Fine-grained combinations for least-privilege access'],
          ]}
        />
        <p>An automated security scanner continuously detects permission gaps, exposed credentials and misconfigurations.</p>
      </DocSection>
    </>
  );
}