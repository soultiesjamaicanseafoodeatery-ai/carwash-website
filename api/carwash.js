import supabase from './_supabase.js';

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://pos.soultiesseafoodjm.com')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  setCORS(res)
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  try {
    if (req.method === 'GET') {
      const { data: services, error: sError } = await supabase
        .from('carwash_services')
        .select('*')
        .order('price', { ascending: true });
      if (sError) throw sError;

      const { data: addons, error: aError } = await supabase
        .from('carwash_addons')
        .select('*')
        .order('price', { ascending: true });
      if (aError) throw aError;

      return res.status(200).json({ services: services || [], addons: addons || [] });
    }
    
    const target = req.body.target || req.query.target;
    const table = target === 'addon' ? 'carwash_addons' : 'carwash_services';

    if (req.method === 'POST') {
      const { target: _, ...itemData } = req.body;
      const { data, error } = await supabase
        .from(table)
        .insert(itemData)
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { target: _, id, ...updates } = req.body;
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
