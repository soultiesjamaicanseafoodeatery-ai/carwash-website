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
      // Load all 4 junction tables in parallel
      const [flvResult, sideResult, addonResult, sizeResult] = await Promise.allSettled([
        supabase.from('item_flavours').select('item_id, flavour_id'),
        supabase.from('item_sides').select('item_id, side_id'),
        supabase.from('item_addons').select('item_id, addon_id'),
        supabase.from('item_sizes').select('item_id, size_id, price'),
      ])

      const flvRows    = (flvResult.status    === 'fulfilled' && !flvResult.value.error)    ? (flvResult.value.data    || []) : []
      const sideRows   = (sideResult.status   === 'fulfilled' && !sideResult.value.error)   ? (sideResult.value.data   || []) : []
      const addonRows  = (addonResult.status  === 'fulfilled' && !addonResult.value.error)  ? (addonResult.value.data  || []) : []
      const sizeRows   = (sizeResult.status   === 'fulfilled' && !sizeResult.value.error)   ? (sizeResult.value.data   || []) : []

      // Build result map keyed by item_id
      const result = {}

      const ensureItem = (id) => {
        if (!result[id]) {
          result[id] = { flavour_ids: [], side_ids: [], addon_ids: [], sizes: [] }
        }
      }

      for (const row of flvRows) {
        ensureItem(row.item_id)
        result[row.item_id].flavour_ids.push(row.flavour_id)
      }
      for (const row of sideRows) {
        ensureItem(row.item_id)
        result[row.item_id].side_ids.push(row.side_id)
      }
      for (const row of addonRows) {
        ensureItem(row.item_id)
        result[row.item_id].addon_ids.push(row.addon_id)
      }
      for (const row of sizeRows) {
        ensureItem(row.item_id)
        result[row.item_id].sizes.push({ size_id: row.size_id, price: Number(row.price) })
      }

      return res.status(200).json(result)
    }

    if (req.method === 'PUT') {
      const { item_id, flavour_ids, side_ids, addon_ids, sizes } = req.body

      if (!item_id) return res.status(400).json({ error: 'item_id is required' })

      // Delete all existing assignments for this item from all 4 tables
      await Promise.all([
        supabase.from('item_flavours').delete().eq('item_id', item_id),
        supabase.from('item_sides').delete().eq('item_id', item_id),
        supabase.from('item_addons').delete().eq('item_id', item_id),
        supabase.from('item_sizes').delete().eq('item_id', item_id),
      ])

      // Re-insert new ones (only if arrays are non-empty)
      const inserts = []

      if (Array.isArray(flavour_ids) && flavour_ids.length > 0) {
        inserts.push(
          supabase.from('item_flavours').insert(
            flavour_ids.map(flavour_id => ({ item_id, flavour_id }))
          )
        )
      }
      if (Array.isArray(side_ids) && side_ids.length > 0) {
        inserts.push(
          supabase.from('item_sides').insert(
            side_ids.map(side_id => ({ item_id, side_id }))
          )
        )
      }
      if (Array.isArray(addon_ids) && addon_ids.length > 0) {
        inserts.push(
          supabase.from('item_addons').insert(
            addon_ids.map(addon_id => ({ item_id, addon_id }))
          )
        )
      }
      if (Array.isArray(sizes) && sizes.length > 0) {
        inserts.push(
          supabase.from('item_sizes').insert(
            sizes.map(s => ({ item_id, size_id: s.size_id, price: s.price ?? 0 }))
          )
        )
      }

      if (inserts.length > 0) {
        const results = await Promise.all(inserts)
        for (const r of results) {
          if (r.error) throw r.error
        }
      }

      return res.status(200).json({ ok: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('assignments API error:', err)
    res.status(500).json({ error: err.message })
  }
}
