import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Check if stock fell below minimum level
    const isLowStock = data.quantity_in_stock <= data.minimum_stock_level;
    const wasNotLowStock = old_data ? old_data.quantity_in_stock > old_data.minimum_stock_level : true;

    if (isLowStock && (event.type === 'create' || wasNotLowStock)) {
      await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
        type: 'low_inventory',
        data: {
          name: data.name,
          part_number: data.part_number,
          category: data.category,
          quantity_in_stock: data.quantity_in_stock,
          minimum_stock_level: data.minimum_stock_level,
          reorder_quantity: data.reorder_quantity,
          supplier: data.supplier,
          lead_time_days: data.lead_time_days
        }
      });
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error handling spare part notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});