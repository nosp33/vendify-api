// routes/produtos.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { validate } from '../lib/validate.js';
import { produtoCreate, produtoUpdate } from '../schemas.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SAFE_ORDER = new Set(['created_at','updated_at','nome','preco','estoque','ativo','id']);
const parseOrder = (order) => {
  if (!order) return { column: 'created_at', ascending: false };
  const [c, d='asc'] = String(order).split('.');
  return { column: SAFE_ORDER.has(c) ? c : 'created_at', ascending: d.toLowerCase() !== 'desc' };
};
const paginate = (p,l) => {
  const page = Math.max(parseInt(p||'1',10)||1,1);
  const limit = Math.min(Math.max(parseInt(l||'20',10)||20,1),100);
  const from = (page-1)*limit; const to = from+limit-1;
  return { page, limit, from, to };
};

router.get('/', async (req, res) => {
  try {
    const { search, ativo, min_price, max_price, include_deleted, only_deleted, order, page, limit } = req.query;
    const { column, ascending } = parseOrder(order);
    const { from, to, page: p, limit: l } = paginate(page, limit);
    let q = supabase.from('produtos').select('*', { count: 'exact' });

    if (only_deleted === 'true') q = q.not('deleted_at','is',null);
    else if (include_deleted === 'true') {/*no-op*/}
    else q = q.is('deleted_at', null);

    if (search) q = q.ilike('nome', `%${search}%`);
    if (ativo === 'true') q = q.eq('ativo', true);
    if (ativo === 'false') q = q.eq('ativo', false);

    const minP = Number.isFinite(+min_price) ? +min_price : undefined;
    const maxP = Number.isFinite(+max_price) ? +max_price : undefined;
    if (minP !== undefined) q = q.gte('preco', minP);
    if (maxP !== undefined) q = q.lte('preco', maxP);

    const { data, error, count } = await q.order(column, { ascending }).range(from, to);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data, meta: { total: count ?? 0, page: p, limit: l, order: { column, ascending } } });
  } catch { res.status(500).json({ error: 'Erro inesperado ao listar produtos.' }); }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params; const { include_deleted } = req.query;
  let q = supabase.from('produtos').select('*').eq('id', id);
  if (include_deleted === 'true') {} else q = q.is('deleted_at', null);
  const { data, error } = await q.single();
  if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Produto não encontrado.' });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', validate(produtoCreate), async (req, res) => {
  const { data, error } = await supabase.from('produtos').insert(req.body).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', validate(produtoUpdate), async (req, res) => {
  const { id } = req.params;
  const body = { ...req.body, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('produtos')
    .update(body).eq('id', id).is('deleted_at', null).select('*').single();
  if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Produto não encontrado para atualizar.' });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('produtos')
    .update({ deleted_at: new Date().toISOString() }).eq('id', id).is('deleted_at', null);
  if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Produto não encontrado para excluir.' });
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

router.post('/:id/restore', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('produtos')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id).not('deleted_at','is',null).select('*').single();
  if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Produto não encontrado para restaurar.' });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
