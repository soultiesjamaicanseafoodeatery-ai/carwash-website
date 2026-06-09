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
      const { data, error } = await supabase
        .from('addons')
        .select('*')
        .order('name', { ascending: true })
      if (error) return res.status(200).json([])
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      const { name, description, price } = req.body
      const { data, error } = await supabase
        .from('addons')
        .insert({
          id: 'ADD-' + Date.now(),
          name,
          description: description ?? '',
          price: price ?? 0,
        })
        .select()
        .single()
      if (error) throw error
      return res.status(201).json(data)
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body
      const { data, error } = await supabase
        .from('addons')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return res.status(200).json(data)
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      const { error } = await supabase
        .from('addons')
        .delete()
        .eq('id', id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('addons API error:', err)
    res.status(500).json({ error: err.message })
  }
}
