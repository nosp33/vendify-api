// lib/validate.js
export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map(i => ({
      path: i.path.join('.'),
      message: i.message
    }));
    return res.status(400).json({ error: 'Payload inválido', details });
  }
  req.body = parsed.data; // já vem coerced/limpo
  next();
};
