import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractor_email, message } = await req.json();

    if (!contractor_email) {
      return Response.json({ error: 'Contractor email is required' }, { status: 400 });
    }

    // Find the contractor's technician record
    const contractors = await base44.asServiceRole.entities.Technician.filter({ 
      email: contractor_email, 
      worker_type: 'contractor' 
    });

    if (contractors.length === 0) {
      return Response.json({ error: 'No registered contractor found with that email address' }, { status: 404 });
    }

    const contractor = contractors[0];

    // Check if already on team (approved)
    if (contractor.approval_status === 'approved') {
      return Response.json({ error: 'This contractor is already on your team' }, { status: 409 });
    }

    // Check for existing pending invitation
    const existingInvites = await base44.asServiceRole.entities.TeamInvitation.filter({
      contractor_email: contractor_email,
      status: 'pending'
    });

    if (existingInvites.length > 0) {
      return Response.json({ error: 'An invitation is already pending for this contractor' }, { status: 409 });
    }

    // Create invitation record
    const invitation = await base44.asServiceRole.entities.TeamInvitation.create({
      contractor_email: contractor_email,
      contractor_name: contractor.name,
      contractor_technician_id: contractor.id,
      invited_by_email: user.email,
      invited_by_name: user.full_name || user.email,
      message: message || '',
      status: 'pending',
    });

    // Send notification email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: contractor_email,
      subject: 'You\'ve been invited to join a team on AssetStack',
      body: `
        <h2>Team Invitation</h2>
        <p>Hi ${contractor.name},</p>
        <p><strong>${user.full_name || user.email}</strong> has invited you to join their team on AssetStack.</p>
        ${message ? `<p>Message: "${message}"</p>` : ''}
        <p>Log in to your AssetStack account to accept or decline this invitation.</p>
        <p>Best regards,<br/>AssetStack</p>
      `
    });

    return Response.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      invitation_id: invitation.id 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});