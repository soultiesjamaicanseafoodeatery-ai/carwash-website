import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { customer_name, customer_phone, customer_email, items, total_amount, discount_amount, final_amount, type, fulfillment_method, delivery_address, delivery_fee } = req.body;
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name,
          customer_phone,
          customer_email,
          total_amount,
          discount_amount,
          final_amount,
          type,
          status: 'pending',
          payment_status: 'paid' // Simulating payment success
        })
        .select()
        .single();
        
      if (orderError) throw orderError;

      // Create order items
      const orderItems = [];
      
      if (fulfillment_method === 'delivery') {
        orderItems.push({
          order_id: order.id,
          item_name: `🚚 DELIVERY: ${delivery_address}`,
          quantity: 1,
          price: delivery_fee || 0
        });
      } else if (fulfillment_method === 'pickup') {
        orderItems.push({
          order_id: order.id,
          item_name: `🏬 PICKUP / ON-SITE`,
          quantity: 1,
          price: 0
        });
      }

      for (const item of items) {
        orderItems.push({
          order_id: order.id,
          item_name: item.plate ? `${item.name} [${item.plate}]` : item.name,
          quantity: item.quantity,
          price: item.price
        });
        
        // Save addons as separate line items for the kitchen/wash bay to see
        if (item.addons && item.addons.length > 0) {
          for (const addon of item.addons) {
            orderItems.push({
              order_id: order.id,
              item_name: `  ↳ Add-on: ${addon.name}`,
              quantity: item.quantity,
              price: addon.price
            });
          }
        }
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return res.status(201).json(order);
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
