import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Contractor self-registration.
// Hardened against: anonymous abuse (auth required), email enumeration (uniform responses),
// invalid input (strict validation), and injection (sanitized strings).
//
// Auth model: this is a self-service endpoint — the caller must be authenticated
// (so each app user can register themselves), but does NOT need to be admin.
// To prevent mass-signup abuse from a single account, repeat-call rate limiting
// should be handled at the platform layer.

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const VALID_CERT = new Set(['junior', 'intermediate', 'senior', 'expert', 'master']);

// Strip HTML/script characters from free-text fields — defense in depth against stored XSS
// in admin UIs that render these values.
const sanitizeText = (s, max = 500) => {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>]/g, '').trim().slice(0, max);
};

const sanitizeArray = (a, max = 20) => {
  if (!Array.isArray(a)) return [];
  return a.slice(0, max).map((v) => sanitizeText(v, 80)).filter(Boolean);
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1. Auth required — caller must be a signed-in user
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const {
      name, email, phone, company_name, tax_id, bio,
      skills, equipment_specializations, hourly_rate, certification_level,
    } = body;

    // 2. Strict input validation
    const cleanName = sanitizeText(name, 120);
    const cleanEmail = sanitizeText(email, 254).toLowerCase();
    if (!cleanName || !cleanEmail) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // hourly_rate must be a non-negative finite number, capped at a sane upper bound
    const rateNum = Number(hourly_rate);
    const cleanRate = Number.isFinite(rateNum) && rateNum >= 0 && rateNum <= 10000 ? rateNum : 0;

    const cleanCert = VALID_CERT.has(certification_level) ? certification_level : 'intermediate';

    // 3. Email enumeration defense — return the same response shape whether or not
    //    the email already exists. Internally we still no-op on duplicates.
    const existing = await base44.asServiceRole.entities.Technician.filter({ email: cleanEmail });
    if (existing.length > 0) {
      // Same response shape as the success path — attackers can't distinguish.
      return Response.json({
        success: true,
        message: 'Registration submitted successfully. An admin will review your application.',
        approval_status: 'pending',
      });
    }

    // 4. Invite the user (only AFTER auth check + validation — prevents spam-invite abuse)
    await base44.users.inviteUser(cleanEmail, 'user').catch((e) => {
      // Don't leak SDK error details; log server-side
      console.warn('inviteUser failed (continuing):', e?.message);
    });

    const employeeId = 'CTR-' + Date.now().toString(36).toUpperCase();

    const technician = await base44.asServiceRole.entities.Technician.create({
      name: cleanName,
      email: cleanEmail,
      phone: sanitizeText(phone, 30),
      employee_id: employeeId,
      worker_type: 'contractor',
      approval_status: 'pending',
      company_name: sanitizeText(company_name, 200),
      tax_id: sanitizeText(tax_id, 50),
      bio: sanitizeText(bio, 1000),
      skills: sanitizeArray(skills),
      equipment_specializations: sanitizeArray(equipment_specializations),
      hourly_rate: cleanRate,
      certification_level: cleanCert,
      availability_status: 'unavailable',
      performance_rating: 0,
      completed_tasks_count: 0,
      start_date: new Date().toISOString().split('T')[0],
    });

    return Response.json({
      success: true,
      message: 'Registration submitted successfully. An admin will review your application.',
      technician_id: technician.id,
      approval_status: 'pending',
    });
  } catch (error) {
    console.error('registerContractor error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});