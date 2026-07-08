// Catch-all para /api/db/* — re-exporta o handler de ../db.js
// Necessário porque Vercel só roteia api/db.js para /api/db exatamente.
// /api/db/inbox, /api/db/atividade etc. precisam desta rota.
export { default, config } from '../db.js';
