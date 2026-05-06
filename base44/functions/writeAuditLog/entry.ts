import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Centralized audit log writer.
// Anyone authenticated can call it (so any function/UI can log its own actions),
// but the actor identity is always taken from the verified session — NOT trusted from the client.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      action,
      category = 'system',
      severity = 'info',
      target_entity,
      target_id,
      target_name,
      summary,
      metadata,
      outcome = 'success',
    } = body;

    if (!action) {
      return Response.json({ error: 'action is required' }, { status: 400 });
    }

    const ipHint =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const entry = await base44.asServiceRole.entities.AuditLogEntry.create({
      actor_email: user.email,
      actor_role: user.role || 'user',
      action,
      category,
      severity,
      target_entity,
      target_id,
      target_name,
      summary,
      metadata: metadata || {},
      ip_hint: ipHint,
      user_agent: userAgent,
      outcome,
    });

    return Response.json({ success: true, id: entry.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});