// ===== imports =====
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi.js';

// ===== app =====
const app = express();
app.set('trust proxy', 1); // IP correto atrás de proxy (Render/Railway/etc.)

// ===== CORS =====
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // Postman/cURL não envia Origin
    return allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error(`Origin não permitida: ${origin}`));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ===== segurança =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ===== body/json =====
app.use(express.json());

// ===== logs com request-id =====
app.use(pinoHttp({
  genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
  autoLogging: true
}));

// ===== rate limit =====
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 min
  max: Number(process.env.RATE_LIMIT_MAX || 300), // máx req/IP por janela
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ===== raiz/health =====
app.get('/', (_req, res) =>
  res.status(200).send('Vendify API ✅ Use /health, /docs, /clientes, /produtos, /vendas')
);

app.get('/health', (_req, res) =>
  res.json({
    ok: true,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      FRONTEND_URL: !!process.env.FRONTEND_URL
    },
    supabase: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  })
);

// ===== docs (Swagger) — logo após /health e ANTES das rotas/404 =====
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));
app.get('/docs.json', (_req, res) => res.json(openapi)); // opcional: JSON da spec

// ===== rotas da API =====
const { default: clientesRoutes } = await import('./routes/clientes.js');
const { default: produtosRoutes } = await import('./routes/produtos.js');
const { default: vendasRoutes }   = await import('./routes/vendas.js');

app.use('/clientes', clientesRoutes);
app.use('/produtos', produtosRoutes);
app.use('/vendas', vendasRoutes);

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    request_id: req.id || null
  });
});

// ===== handler global de erro =====
app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  const status = Number(err.status || 500);
  res.status(status).json({
    error: status >= 500 ? 'Erro interno do servidor' : String(err.message || 'Erro'),
    request_id: req.id || null
  });
});

// ===== sobe servidor =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
