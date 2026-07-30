// Roda antes de toda a suíte de testes. Garante que variáveis de ambiente
// necessárias (ex: JWT_SECRET) existam mesmo se o .env não for carregado
// no ambiente de teste/CI.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-only-for-tests";