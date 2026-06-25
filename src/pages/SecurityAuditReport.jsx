import React from 'react';

const findings = [
  {
    id: 'SEC-001',
    severity: 'CRITICAL',
    component: 'Multi-Tenancy Gateway',
    finding: 'Cross-tenant data leakage via unsecured entity list calls bypassing client_account_id scoping. Direct base44.entities calls in ConditionDefects page expose records across tenants.',
    recommendation: 'Replace all direct entity.list() calls with secureEntityQuery backend function to enforce tenant isolation at the data layer.',
    status: 'OPEN',
  },
  {
    id: 'SEC-002',
    severity: 'CRITICAL',
    component: 'Authentication',
    finding: 'Backend functions accessible without auth validation on webhook endpoints. Several functions do not call base44.auth.me() before processing payloads.',
    recommendation: 'Add auth.me() check with 401 guard to all backend functions. Validate shared secrets on all external webhook endpoints.',
    status: 'IN REMEDIATION',
  },
  {
    id: 'SEC-003',
    severity: 'HIGH',
    component: 'API Gateway',
    finding: 'Missing rate limiting on public-facing condition assessment and scan analysis endpoints, exposing them to abuse and DoS vectors.',
    recommendation: 'Implement request throttling at the gateway level. Add per-client quota enforcement on computationally expensive AI endpoints.',
    status: 'OPEN',
  },
  {
    id: 'SEC-004',
    severity: 'HIGH',
    component: 'File Storage',
    finding: 'Private file URIs accessible without signed URL validation in some upload flows. UploadFile integration returns public URLs for assets that should be private.',
    recommendation: 'Migrate sensitive file uploads to UploadPrivateFile integration and serve via CreateFileSignedUrl with short expiry windows.',
    status: 'OPEN',
  },
  {
    id: 'SEC-005',
    severity: 'HIGH',
    component: 'Audit Logging',
    finding: 'Incomplete audit trail — bulk update and deleteMany operations are not captured in AuditLogEntry, creating gaps in the compliance record.',
    recommendation: 'Extend writeAuditLog function to wrap all bulk entity operations. Ensure every mutation is attributable to a user and timestamp.',
    status: 'OPEN',
  },
  {
    id: 'SEC-006',
    severity: 'HIGH',
    component: 'Role Management',
    finding: 'Several admin-only backend functions lack server-side role verification. Client-side PermissionGate does not substitute for server-side enforcement.',
    recommendation: 'Add user.role === "admin" check with 403 Forbidden response to all admin-only backend functions after auth.me() validation.',
    status: 'IN REMEDIATION',
  },
  {
    id: 'SEC-007',
    severity: 'MEDIUM',
    component: 'Session Management',
    finding: 'Long-lived tokens without rotation policy on mobile field-survey sessions. Offline inspection queue tokens may persist beyond acceptable window.',
    recommendation: 'Implement token expiry and rotation for mobile sessions. Require re-authentication after 8 hours of inactivity on field devices.',
    status: 'OPEN',
  },
  {
    id: 'SEC-008',
    severity: 'MEDIUM',
    component: 'Data Encryption',
    finding: 'Sensor readings and condition grades stored without field-level encryption for potentially sensitive infrastructure data.',
    recommendation: 'Evaluate field-level encryption for SensorReading.value and ConditionAssessment data at rest. Prioritise for regulated sectors.',
    status: 'PLANNED',
  },
  {
    id: 'SEC-009',
    severity: 'MEDIUM',
    component: 'Dependency Scanning',
    finding: '3 NPM packages with known moderate CVEs identified: react-quill (XSS vector in older content), html2canvas (prototype pollution), and mermaid (ReDoS).',
    recommendation: 'Update react-quill to latest patched version. Evaluate replacing html2canvas with html-to-image. Pin mermaid to patched release.',
    status: 'OPEN',
  },
  {
    id: 'SEC-010',
    severity: 'MEDIUM',
    component: 'Input Validation',
    finding: 'File upload endpoints do not enforce strict MIME type validation server-side. Only client-side accept attribute filtering is present.',
    recommendation: 'Add server-side MIME type sniffing and file size enforcement in backend upload functions before passing to storage.',
    status: 'OPEN',
  },
  {
    id: 'SEC-011',
    severity: 'LOW',
    component: 'HTTP Headers',
    finding: 'Missing Content-Security-Policy and X-Frame-Options headers on marketing and public landing pages.',
    recommendation: 'Configure CSP headers to restrict script sources. Add X-Frame-Options: DENY to prevent clickjacking on all public routes.',
    status: 'PLANNED',
  },
  {
    id: 'SEC-012',
    severity: 'LOW',
    component: 'Error Handling',
    finding: 'Some backend function error responses leak internal stack traces and entity schema details in 500 responses.',
    recommendation: 'Standardise error responses to return only error.message. Log full stack traces server-side only, never in the response body.',
    status: 'PLANNED',
  },
  {
    id: 'SEC-013',
    severity: 'LOW',
    component: 'CORS Policy',
    finding: 'CORS policy on backend functions is permissive for development. Wildcard origins should not be present in production.',
    recommendation: 'Restrict CORS allowed origins to known production and staging domains only before go-live.',
    status: 'OPEN',
  },
];

const severityConfig = {
  CRITICAL: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600 text-white', dot: 'bg-red-600', label: 'CRITICAL', order: 1 },
  HIGH:     { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500 text-white', dot: 'bg-orange-500', label: 'HIGH', order: 2 },
  MEDIUM:   { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-500 text-white', dot: 'bg-yellow-500', label: 'MEDIUM', order: 3 },
  LOW:      { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-500 text-white', dot: 'bg-blue-500', label: 'LOW', order: 4 },
};

const statusConfig = {
  'OPEN':           'bg-red-100 text-red-700',
  'IN REMEDIATION': 'bg-amber-100 text-amber-700',
  'PLANNED':        'bg-blue-100 text-blue-700',
  'RESOLVED':       'bg-green-100 text-green-700',
};

const counts = findings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, {});

export default function SecurityAuditReport() {
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:py-0">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">

        {/* Header */}
        <div className="bg-slate-900 text-white px-10 py-8 print:px-8 print:py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-indigo-300 font-semibold text-sm tracking-widest uppercase">AssetStack</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-1">Security Audit Report</h1>
              <p className="text-slate-400 text-sm">Platform Security Assessment — June 2026</p>
            </div>
            <div className="text-right text-xs text-slate-400 space-y-1 mt-1">
              <p><span className="text-slate-500">Classification:</span> <span className="text-red-400 font-semibold">CONFIDENTIAL</span></p>
              <p><span className="text-slate-500">Version:</span> 1.0</p>
              <p><span className="text-slate-500">Date:</span> 25 June 2026</p>
              <p><span className="text-slate-500">Prepared by:</span> AssetStack Security Team</p>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 print:px-8 space-y-8">

          {/* Executive Summary */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Executive Summary</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 text-sm leading-relaxed">
              This report presents findings from a comprehensive security audit of the AssetStack platform conducted in June 2026. A total of <strong>{findings.length} findings</strong> were identified across authentication, data isolation, API security, file storage, and infrastructure layers. Two critical vulnerabilities require immediate remediation prior to any enterprise client onboarding. All findings are ranked by severity and include actionable remediation guidance.
            </div>
          </section>

          {/* Summary Counts */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Findings Overview</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { sev: 'CRITICAL', count: counts.CRITICAL || 0, color: 'border-red-500 bg-red-50', text: 'text-red-700', num: 'text-red-600' },
                { sev: 'HIGH',     count: counts.HIGH || 0,     color: 'border-orange-400 bg-orange-50', text: 'text-orange-700', num: 'text-orange-500' },
                { sev: 'MEDIUM',   count: counts.MEDIUM || 0,   color: 'border-yellow-400 bg-yellow-50', text: 'text-yellow-700', num: 'text-yellow-600' },
                { sev: 'LOW',      count: counts.LOW || 0,      color: 'border-blue-400 bg-blue-50', text: 'text-blue-700', num: 'text-blue-500' },
              ].map(({ sev, count, color, text, num }) => (
                <div key={sev} className={`border-2 rounded-xl p-4 text-center ${color}`}>
                  <div className={`text-3xl font-black ${num}`}>{count}</div>
                  <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${text}`}>{sev}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Status Summary */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Remediation Status</h2>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              {[
                { label: 'Open', count: findings.filter(f => f.status === 'OPEN').length, cls: 'bg-red-50 border-red-200 text-red-700' },
                { label: 'In Remediation', count: findings.filter(f => f.status === 'IN REMEDIATION').length, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
                { label: 'Planned', count: findings.filter(f => f.status === 'PLANNED').length, cls: 'bg-blue-50 border-blue-200 text-blue-700' },
              ].map(({ label, count, cls }) => (
                <div key={label} className={`border rounded-xl p-4 ${cls}`}>
                  <div className="text-2xl font-black">{count}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide mt-1">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Findings */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Detailed Findings</h2>
            <div className="space-y-4">
              {findings.map((f, idx) => {
                const s = severityConfig[f.severity];
                return (
                  <div key={f.id} className={`border rounded-xl overflow-hidden ${s.border}`}>
                    <div className={`flex items-center justify-between px-5 py-3 ${s.bg}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-xs font-bold w-5">#{idx + 1}</span>
                        <span className="font-mono text-xs font-bold text-slate-600">{f.id}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.badge}`}>{f.severity}</span>
                        <span className="text-sm font-semibold text-slate-800">{f.component}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusConfig[f.status]}`}>{f.status}</span>
                    </div>
                    <div className="px-5 py-4 bg-white space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Finding</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{f.finding}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Recommendation</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{f.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 flex items-center justify-between text-xs text-slate-400">
            <span>AssetStack Pty Ltd — Confidential</span>
            <span>Security Audit Report — June 2026 — v1.0</span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors print:hidden"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Export PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}