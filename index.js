import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import produtosRoutes from './routes/produtos.js';
import vendasRoutes from './routes/vendas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/produtos', produtosRoutes);
app.use('/vendas', vendasRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Vendify API rodando com sucesso!');
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
