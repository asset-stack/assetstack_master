import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Safely provision an isolated ClientAccount for the calling user.
// Guarantees tenant isolation on signup:
//   - If the caller already belongs to a real (non-demo) account, return it (no duplicate).
//   - Otherwise create a brand-new account with allowed_users = [caller email] ONLY.
// A new user therefore never lands inside an existing/demo tenant.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const requestedName = (body?.business_name || '').toString().trim();

    const isDemo = (name) => /demo|council|bunbury/i.test(name || '');

    const allClients = await base44.asServiceRole.entities.ClientAccount.list('-created_date', 500);

    // Already a member of a real account? Reuse it — never create a second one.
    const existing = allClients.find(
      (c) => Array.isArray(c.allowed_users) && c.allowed_users.includes(user.email) && !isDemo(c.business_name)
    );
    if (existing) {
      return Response.json({ data: existing, created: false });
    }

    const businessName = requestedName || (user.full_name ? `${user.full_name}'s Account` : `Account ${user.email}`);

    const created = await base44.asServiceRole.entities.ClientAccount.create({
      business_name: businessName,
      contact_name: user.full_name || '',
      contact_email: user.email,
      subscription_level: 'professional',
      status: 'active',
      allowed_users: [user.email],
    });

    // Audit the provisioning for traceability.
    try {
      await base44.asServiceRole.entities.AuditLogEntry.create({
        actor_email: user.email,
        actor_role: user.role || 'user',
        action: 'account.provision',
        category: 'security',
        severity: 'notice',
        target_entity: 'ClientAccount',
        target_id: created.id,
        target_name: businessName,
        summary: `Provisioned isolated account for ${user.email}`,
        outcome: 'success',
      });
    } catch (_) { /* audit is best-effort */ }

    return Response.json({ data: created, created: true });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});