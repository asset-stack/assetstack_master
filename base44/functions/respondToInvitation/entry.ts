import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitation_id, action } = await req.json();

    if (!invitation_id || !action || !['accept', 'decline'].includes(action)) {
      return Response.json({ error: 'invitation_id and action (accept/decline) are required' }, { status: 400 });
    }

    // Get the invitation
    const invitations = await base44.asServiceRole.entities.TeamInvitation.filter({ id: invitation_id });
    if (invitations.length === 0) {
      return Response.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const invitation = invitations[0];

    // Verify the current user is the invited contractor
    if (invitation.contractor_email !== user.email) {
      return Response.json({ error: 'This invitation is not for you' }, { status: 403 });
    }

    if (invitation.status !== 'pending') {
      return Response.json({ error: 'This invitation has already been responded to' }, { status: 409 });
    }

    if (action === 'accept') {
      // Verify the technician record actually belongs to the invitee (prevent IDOR
      // where a tampered invitation could approve someone else's technician record).
      const technician = await base44.asServiceRole.entities.Technician.filter({
        id: invitation.contractor_technician_id,
      });
      if (technician.length === 0 || technician[0].email !== user.email) {
        return Response.json({ error: 'Invitation does not match your technician record' }, { status: 403 });
      }

      // Update technician to approved
      await base44.asServiceRole.entities.Technician.update(invitation.contractor_technician_id, {
        approval_status: 'approved',
        availability_status: 'available',
      });

      // Update invitation status
      await base44.asServiceRole.entities.TeamInvitation.update(invitation_id, {
        status: 'accepted',
      });

      // Notify the inviter
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: invitation.invited_by_email,
        subject: `${invitation.contractor_name} accepted your team invitation`,
        body: `
          <h2>Invitation Accepted</h2>
          <p>${invitation.contractor_name} (${invitation.contractor_email}) has accepted your team invitation on AssetStack.</p>
          <p>They are now part of your team and available for task assignments.</p>
        `
      });

      return Response.json({ success: true, message: 'Invitation accepted. You are now part of the team!' });
    } else {
      // Decline
      await base44.asServiceRole.entities.TeamInvitation.update(invitation_id, {
        status: 'declined',
      });

      return Response.json({ success: true, message: 'Invitation declined.' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});