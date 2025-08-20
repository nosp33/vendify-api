// schemas.js
import { z } from 'zod';

// helpers
const uuid = z.string().uuid();
const money = z.coerce.number().min(0, 'não pode ser negativo');
const intNZ = z.coerce.number().int().min(0, 'não pode ser negativo');

export const produtoCreate = z.object({
  nome: z.string().trim().min(1, 'nome é obrigatório'),
  preco: money.default(0),
  estoque: intNZ.default(0),
  descricao: z.string().trim().min(1).optional().nullable(),
  ativo: z.coerce.boolean().optional()
});
export const produtoUpdate = produtoCreate.partial();

export const clienteCreate = z.object({
  nome: z.string().trim().min(1, 'nome é obrigatório'),
  email: z.string().trim().email('email inválido').optional().nullable(),
  telefone: z.string().trim().min(3).optional().nullable(),
  endereco: z.string().trim().min(3).optional().nullable(),
  ativo: z.coerce.boolean().optional()
});
export const clienteUpdate = clienteCreate.partial();

export const vendaStatus = z.enum(['pendente','pago','cancelado','entregue']);

export const vendaCreate = z.object({
  cliente_id: uuid.optional().nullable(),
  produto_id: uuid.optional().nullable(),
  quantidade: intNZ.default(1),
  preco_unit: money.default(0),
  status: vendaStatus.default('pendente')
});
export const vendaUpdate = z.object({
  cliente_id: uuid.optional().nullable(),
  produto_id: uuid.optional().nullable(),
  quantidade: intNZ.optional(),
  preco_unit: money.optional(),
  status: vendaStatus.optional()
});
