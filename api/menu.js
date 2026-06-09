import supabase from './_supabase.js';

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://pos.soultiesseafoodjm.com')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

// Normalize a DB row → unified shape both POS and website can read
function normalizeRow(r) {
  return {
    ...r,
    // POS uses 'active', website uses 'is_available' — expose both
    active: r.active ?? r.is_available ?? true,
    is_available: r.is_available ?? r.active ?? true,
  }
}

// Build a safe DB write object from any incoming body shape
function buildWriteData(body) {
  const out = {}
  if (body.name        !== undefined) out.name        = body.name
  if (body.description !== undefined) out.description = body.description
  if (body.price       !== undefined) out.price       = body.price
  if (body.category    !== undefined) out.category    = body.category
  if (body.image_url   !== undefined) out.image_url   = body.image_url
  if (body.emoji       !== undefined) out.emoji       = body.emoji
  // active (POS) and is_available (website) both map to is_available column
  // If active is explicitly passed, use it; is_available takes precedence
  if (body.active      !== undefined) out.is_available = body.active
  if (body.is_available !== undefined) out.is_available = body.is_available
  return out
}

export default async function handler(req, res) {
  setCORS(res)
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return res.status(200).json((data || []).map(normalizeRow));
    }

    if (req.method === 'POST') {
      const writeData = buildWriteData(req.body)
      if (!writeData.is_available && writeData.active === undefined) {
        writeData.is_available = true // default to available
      }
      let result
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .insert(writeData)
          .select()
          .single();
        if (error) throw error;
        result = data
      } catch (err) {
        // If emoji column doesn't exist yet, retry without it
        if (err.message && err.message.includes('emoji')) {
          const { emoji: _e, ...withoutEmoji } = writeData
          const { data, error } = await supabase
            .from('menu_items')
            .insert(withoutEmoji)
            .select()
            .single();
          if (error) throw error;
          result = data
        } else {
          throw err
        }
      }
      return res.status(201).json(normalizeRow(result));
    }

    if (req.method === 'PUT') {
      const { id, ...body } = req.body;
      const updates = buildWriteData(body)
      let result
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        result = data
      } catch (err) {
        // If emoji column doesn't exist yet, retry without it
        if (err.message && err.message.includes('emoji')) {
          const { emoji: _e, ...withoutEmoji } = updates
          const { data, error } = await supabase
            .from('menu_items')
            .update(withoutEmoji)
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          result = data
        } else {
          throw err
        }
      }
      return res.status(200).json(normalizeRow(result));
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const { error } = await supabase
        .from('menu_items')
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
