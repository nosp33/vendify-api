// openapi.js
export default {
  openapi: "3.0.3",
  info: {
    title: "Vendify API",
    version: "1.0.0",
    description: "Documentação da API (clientes, produtos, vendas)."
  },
servers: [
  { url: "http://localhost:3000", description: "Local" },
  { url: "https://vendify-api-7k7k.onrender.com", description: "Produção" }
],

  tags: [
    { name: "Health" }, { name: "Produtos" }, { name: "Clientes" }, { name: "Vendas" }
  ],
  components: {
    schemas: {
      Produto: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string" },
          preco: { type: "number" },
          estoque: { type: "integer" },
          descricao: { type: "string", nullable: true },
          ativo: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          deleted_at: { type: "string", format: "date-time", nullable: true }
        }
      },
      Cliente: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string" },
          email: { type: "string", nullable: true },
          telefone: { type: "string", nullable: true },
          endereco: { type: "string", nullable: true },
          ativo: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          deleted_at: { type: "string", format: "date-time", nullable: true }
        }
      },
      Venda: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          cliente_id: { type: "string", format: "uuid", nullable: true },
          produto_id: { type: "string", format: "uuid", nullable: true },
          quantidade: { type: "integer" },
          preco_unit: { type: "number" },
          total: { type: "number" },
          status: { type: "string", enum: ["pendente","pago","cancelado","entregue"] },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          deleted_at: { type: "string", format: "date-time", nullable: true }
        }
      }
    },
    parameters: {
      IdParam: { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
    }
  },
  paths: {
    "/health": {
      get: { tags: ["Health"], summary: "Status da API", responses: { "200": { description: "OK" } } }
    },

    "/produtos": {
      get: {
        tags: ["Produtos"], summary: "Listar produtos",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "ativo", in: "query", schema: { type: "string", enum: ["true","false"] } },
          { name: "include_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } },
          { name: "only_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } },
          { name: "order", in: "query", schema: { type: "string", example: "created_at.desc" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Produtos"], summary: "Criar produto",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Produto" } } } },
        responses: { "201": { description: "Criado" }, "400": { description: "Payload inválido" } }
      }
    },
    "/produtos/{id}": {
      get: {
        tags: ["Produtos"], summary: "Obter por id",
        parameters: [{ $ref: "#/components/parameters/IdParam" }, { name: "include_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } }],
        responses: { "200": { description: "OK" }, "404": { description: "Não encontrado" } }
      },
      put: {
        tags: ["Produtos"], summary: "Atualizar",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Produto" } } } },
        responses: { "200": { description: "Atualizado" }, "400": { description: "Payload inválido" } }
      },
      delete: {
        tags: ["Produtos"], summary: "Soft delete",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { "204": { description: "Deletado" }, "404": { description: "Não encontrado" } }
      }
    },
    "/produtos/{id}/restore": {
      post: { tags: ["Produtos"], summary: "Restaurar", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { "200": { description: "Restaurado" } } }
    },

    "/clientes": {
      get: {
        tags: ["Clientes"], summary: "Listar clientes",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "ativo", in: "query", schema: { type: "string", enum: ["true","false"] } },
          { name: "include_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } },
          { name: "only_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } },
          { name: "order", in: "query", schema: { type: "string", example: "created_at.desc" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Clientes"], summary: "Criar cliente",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } } },
        responses: { "201": { description: "Criado" }, "400": { description: "Payload inválido" } }
      }
    },
    "/clientes/{id}": {
      get: {
        tags: ["Clientes"], summary: "Obter por id",
        parameters: [{ $ref: "#/components/parameters/IdParam" }, { name: "include_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } }],
        responses: { "200": { description: "OK" }, "404": { description: "Não encontrado" } }
      },
      put: {
        tags: ["Clientes"], summary: "Atualizar",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } } },
        responses: { "200": { description: "Atualizado" }, "400": { description: "Payload inválido" }, "404": { description: "Não encontrado" } }
      },
      delete: {
        tags: ["Clientes"], summary: "Soft delete",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { "204": { description: "Deletado" }, "404": { description: "Não encontrado" } }
      }
    },
    "/clientes/{id}/restore": {
      post: { tags: ["Clientes"], summary: "Restaurar", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { "200": { description: "Restaurado" } } }
    },

    "/vendas": {
      get: {
        tags: ["Vendas"], summary: "Listar vendas",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "cliente_id", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "produto_id", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "date_from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "date_to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "include_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } },
          { name: "only_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } },
          { name: "order", in: "query", schema: { type: "string", example: "created_at.desc" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Vendas"], summary: "Criar venda",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Venda" } } } },
        responses: { "201": { description: "Criado" }, "400": { description: "Payload inválido" } }
      }
    },
    "/vendas/{id}": {
      get: {
        tags: ["Vendas"], summary: "Obter por id",
        parameters: [{ $ref: "#/components/parameters/IdParam" }, { name: "include_deleted", in: "query", schema: { type: "string", enum: ["true","false"] } }],
        responses: { "200": { description: "OK" }, "404": { description: "Não encontrado" } }
      },
      put: {
        tags: ["Vendas"], summary: "Atualizar",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Venda" } } } },
        responses: { "200": { description: "Atualizado" }, "400": { description: "Payload inválido" }, "404": { description: "Não encontrado" } }
      },
      delete: {
        tags: ["Vendas"], summary: "Soft delete",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { "204": { description: "Deletado" }, "404": { description: "Não encontrado" } }
      }
    },
    "/vendas/{id}/restore": {
      post: { tags: ["Vendas"], summary: "Restaurar", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { "200": { description: "Restaurado" } } }
    }
  }
};
