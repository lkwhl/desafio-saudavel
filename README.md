# Desafio Saudável 💪

App de tracking de hábitos para o desafio 01/07–16/08.

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute todo o conteúdo de `supabase_setup.sql`
3. Vá em **Authentication → Users → Add user** e crie os dois usuários:
   - Você: `lucas@seudominio.com` + senha
   - Ela: `namorada@dominio.com` + senha
4. Pegue os UUIDs gerados (coluna `id` na tabela `auth.users` via Table Editor)
5. No SQL Editor, execute o INSERT de `user_profiles` com os UUIDs reais:
   ```sql
   INSERT INTO public.user_profiles (user_id, display_name) VALUES
     ('uuid-do-lucas', 'Lucas'),
     ('uuid-dela', 'Nome dela');
   ```

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha com os valores de **Settings → API** no Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 3. Rodar local

```bash
npm install
npm run dev
```

### 4. Deploy na Vercel

```bash
npx vercel
```

Adicione as duas env vars no painel da Vercel (Settings → Environment Variables).

---

## Sistema de pontos

| Item | Pontos |
|---|---|
| 💧 2L de água | 2 |
| 🍎 1 fruta | 1 |
| 🥦 1 legume no almoço | 1 |
| 🚫 Sem fast food | 3 |
| 📖 2 páginas de livro | 2 |
| 🚬 ≤10 cigarros | 3 |
| 🚬 ≤7 cigarros | 5 |
| 🚬 ≤5 cigarros | 8 |
| 🚬 0 cigarros | 15 |
| ⭐ Dia perfeito (tudo + 0 cig) | +10 bônus |
| 🏋️ 1x treino/semana | 2 |
| 🏋️ 2x treino/semana | 5 |
| 🏋️ 3x treino/semana | 10 |
| 🏋️ 4x+ treino/semana | 20 |
| 🔥 Streak 3 dias perfeitos | +10 bônus |
| 🔥 Streak 7 dias perfeitos | +25 bônus |
| 🔥 Streak 14 dias perfeitos | +60 bônus |
