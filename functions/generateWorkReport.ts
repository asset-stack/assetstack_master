import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { technician_id } = await req.json();
    if (!technician_id) {
      return Response.json({ error: 'technician_id required' }, { status: 400 });
    }

    // Fetch technician
    const technicians = await base44.asServiceRole.entities.Technician.filter({ id: technician_id });
    const technician = technicians[0];
    if (!technician) {
      return Response.json({ error: 'Technician not found' }, { status: 404 });
    }

    // Fetch tasks assigned to this technician
    const tasks = await base44.asServiceRole.entities.MaintenanceTask.filter({ assigned_to: technician.name });
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Fetch work orders
    const workOrders = await base44.asServiceRole.entities.WorkOrder.filter({ assigned_to: technician.name });

    // Fetch kudos
    const kudos = await base44.asServiceRole.entities.KudosMessage.filter({ to_technician_id: technician_id });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(79, 70, 229); // indigo
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Professional Work Report', 20, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 32);
    doc.text('AssetStack - Asset Management Platform', 20, 39);
    
    y = 60;
    doc.setTextColor(30, 41, 59); // slate-800

    // Personal Info Section
    doc.setFontSize(16);
    doc.text('Personal Information', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-500

    const infoLines = [
      ['Name', technician.name || 'N/A'],
      ['Type', (technician.worker_type || 'employee').charAt(0).toUpperCase() + (technician.worker_type || 'employee').slice(1)],
      ['Email', technician.email || 'N/A'],
      ['Phone', technician.phone || 'N/A'],
      ['Certification Level', (technician.certification_level || 'intermediate').charAt(0).toUpperCase() + (technician.certification_level || 'intermediate').slice(1)],
      ['Employee ID', technician.employee_id || 'N/A'],
    ];
    if (technician.company_name) infoLines.push(['Company', technician.company_name]);
    if (technician.bio) infoLines.push(['Bio', technician.bio]);

    infoLines.forEach(([label, value]) => {
      doc.setTextColor(100, 116, 139);
      doc.text(`${label}:`, 20, y);
      doc.setTextColor(30, 41, 59);
      doc.text(String(value), 75, y);
      y += 7;
    });

    if (technician.skills?.length > 0) {
      doc.setTextColor(100, 116, 139);
      doc.text('Skills:', 20, y);
      doc.setTextColor(30, 41, 59);
      doc.text(technician.skills.join(', '), 75, y, { maxWidth: 115 });
      y += 10;
    }

    // Performance Summary
    y += 5;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(15, y - 5, pageWidth - 30, 55, 'F');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Performance Summary', 20, y + 3);
    y += 12;
    doc.setFontSize(10);

    const metrics = [
      ['Tasks Completed', String(completedTasks.length)],
      ['Total Tasks Assigned', String(tasks.length)],
      ['Completion Rate', tasks.length > 0 ? `${Math.round((completedTasks.length / tasks.length) * 100)}%` : 'N/A'],
      ['Performance Rating', `${technician.performance_rating || 0}/100`],
      ['First-Time Fix Rate', `${technician.first_time_fix_rate || 0}%`],
      ['On-Time Completion', `${technician.on_time_completion_rate || 0}%`],
      ['Avg Completion Time', `${technician.average_task_completion_time || 0} hours`],
      ['Kudos Received', String(kudos.length)],
    ];

    for (let i = 0; i < metrics.length; i += 2) {
      const [label1, value1] = metrics[i];
      doc.setTextColor(100, 116, 139);
      doc.text(`${label1}:`, 20, y);
      doc.setTextColor(30, 41, 59);
      doc.text(value1, 75, y);
      
      if (metrics[i + 1]) {
        const [label2, value2] = metrics[i + 1];
        doc.setTextColor(100, 116, 139);
        doc.text(`${label2}:`, 110, y);
        doc.setTextColor(30, 41, 59);
        doc.text(value2, 165, y);
      }
      y += 7;
    }

    // Work History
    y += 10;
    if (y > 250) { doc.addPage(); y = 20; }
    
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Work History', 20, y);
    y += 8;

    // Table header
    doc.setFillColor(79, 70, 229);
    doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Task', 20, y);
    doc.text('Type', 90, y);
    doc.text('Status', 120, y);
    doc.text('Date', 150, y);
    doc.text('Hours', 180, y);
    y += 8;

    completedTasks.slice(0, 30).forEach((task, i) => {
      if (y > 275) { doc.addPage(); y = 20; }
      
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y - 4, pageWidth - 30, 7, 'F');
      }
      
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      const title = task.title?.length > 35 ? task.title.substring(0, 35) + '...' : task.title || 'Untitled';
      doc.text(title, 20, y);
      doc.setTextColor(100, 116, 139);
      doc.text(task.type || 'N/A', 90, y);
      doc.text(task.status || 'N/A', 120, y);
      doc.text(task.completed_date ? new Date(task.completed_date).toLocaleDateString() : 'N/A', 150, y);
      doc.text(task.actual_duration_hours ? `${task.actual_duration_hours}h` : 'N/A', 180, y);
      y += 7;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${totalPages} | AssetStack Work Report | Confidential`, 20, 290);
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${technician.name?.replace(/\s+/g, '_')}_Work_Report.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});