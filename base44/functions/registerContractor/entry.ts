import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { name, email, phone, company_name, tax_id, bio, skills, equipment_specializations, hourly_rate, certification_level } = body;

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if a technician with this email already exists
    const existing = await base44.asServiceRole.entities.Technician.filter({ email });
    if (existing.length > 0) {
      return Response.json({ error: 'A contractor with this email already exists' }, { status: 409 });
    }

    // Invite the user to the app (they'll get a login)
    await base44.users.inviteUser(email, 'user');

    // Generate a contractor employee_id
    const employeeId = 'CTR-' + Date.now().toString(36).toUpperCase();

    // Create the technician record with pending approval
    const technician = await base44.asServiceRole.entities.Technician.create({
      name,
      email,
      phone: phone || '',
      employee_id: employeeId,
      worker_type: 'contractor',
      approval_status: 'approved',
      company_name: company_name || '',
      tax_id: tax_id || '',
      bio: bio || '',
      skills: skills || [],
      equipment_specializations: equipment_specializations || [],
      hourly_rate: hourly_rate || 0,
      certification_level: certification_level || 'intermediate',
      availability_status: 'unavailable',
      performance_rating: 0,
      completed_tasks_count: 0,
      start_date: new Date().toISOString().split('T')[0],
    });

    return Response.json({ 
      success: true, 
      message: 'Registration submitted successfully. An admin will review your application.',
      technician_id: technician.id 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});