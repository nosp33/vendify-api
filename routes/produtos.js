// routes/produtos.js — produção
import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';

const router = Router();

// ===== Schemas =====
const uuidSchema = z.string().uuid('id inválido');

const produtoCreateSchema = z.object({
  nome: z.string().min(1, 'nome é obrigatório'),
  sku: z.string().min(1, 'sku é obrigatório'),
  preco: z.number({ invalid_type_error: 'preco deve ser número' }),
  estoque: z.number({ invalid_type_error: 'estoque deve ser número' }).int('estoque deve ser inteiro'),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true)
});

const produtoUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  preco: z.number().optional(),
  estoque: z.number().int().optional(),
  descricao: z.string().nullable().optional(),
  ativo: z.boolean().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'corpo vazio' });

// ===== Helpers =====
function mapDbErrorToHttp(error) {
  // Postgres unique violation
  if (error?.code === '23505') return { status: 409, msg: 'SKU já existe' };
  // PostgREST codes (ex.: PGRST204 coluna não existe etc.)
  if (String(error?.code || '').startsWith('PGRST')) return { status: 400, msg: 'Erro de validação no banco' };
  return { status: 500, msg: 'Erro interno' };
}

// ===== GET /produtos =====
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) return next(error);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// ===== GET /produtos/:id =====
router.get('/:id', async (req, res) => {
  const parse = uuidSchema.safeParse(req.params.id);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues[0].message });

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', parse.data)
    .is('deleted_at', null)
    .single();

  if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'Produto não encontrado' }); // no rows
  if (error) return res.status(500).json({ error: 'Erro ao buscar' });

  return res.json(data);
});

// ===== POST /produtos =====
router.post('/', async (req, res) => {
  const parsed = produtoCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return res.status(400).json({ error: first?.message || 'payload inválido' });
  }

  const payload = parsed.data;
  const { data, error } = await supabase
    .from('produtos')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    const mapped = mapDbErrorToHttp(error);
    req.log?.warn({ err: error, payload }, 'POST /produtos falhou');
    return res.status(mapped.status).json({ error: mapped.msg });
  }

  return res.status(201).json(data);
});

// ===== PUT /produtos/:id =====
router.put('/:id', async (req, res) => {
  const idParse = uuidSchema.safeParse(req.params.id);
  if (!idParse.success) return res.status(400).json({ error: idParse.error.issues[0].message });

  const bodyParse = produtoUpdateSchema.safeParse(req.body);
  if (!bodyParse.success) {
    const first = bodyParse.error.issues[0];
    return res.status(400).json({ error: first?.message || 'payload inválido' });
  }

  const { data, error } = await supabase
    .from('produtos')
    .update(bodyParse.data)
    .eq('id', idParse.data)
    .is('deleted_at', null)
    .select('*')
    .single();

  if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'Produto não encontrado' });
  if (error) {
    const mapped = mapDbErrorToHttp(error);
    req.log?.warn({ err: error, body: bodyParse.data }, 'PUT /produtos falhou');
    return res.status(mapped.status).json({ error: mapped.msg });
  }

  return res.json(data);
});

// ===== DELETE /produtos/:id (soft delete) =====
router.delete('/:id', async (req, res) => {
  const parse = uuidSchema.safeParse(req.params.id);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues[0].message });

  const { data, error } = await supabase
    .from('produtos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', parse.data)
    .is('deleted_at', null)
    .select('id')
    .single();

  if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'Produto não encontrado' });
  if (error) return res.status(500).json({ error: 'Erro ao deletar' });

  return res.status(204).send();
});

export default router;
