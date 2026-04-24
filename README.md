# Pedir Músicas — Aniversário da Anna Laura

App mobile-first para a galera da festa pedir músicas para a banda tocar ao vivo.

## Telas

- `/` — **Público**: formulário para enviar o pedido (música + recado opcional).
- `/artista` — **Banda**: lista em tempo real dos pedidos, com opções de marcar como tocada, apagar e limpar tocadas. Atualiza sozinha a cada 3s.

> A URL do artista é pública — qualquer pessoa que souber o caminho acessa.
> Para disfarçar, renomeie a pasta `app/artista` para algo difícil de adivinhar
> (ex.: `app/palco-anna-laura`) e avise só a banda.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Upstash Redis via Vercel Marketplace (tudo configurado no dashboard do Vercel)

## Rodar local

```bash
npm install
cp .env.local.example .env.local   # opcional: preencha com as chaves do Upstash
npm run dev
```

Sem as variáveis do Upstash, o app usa um store em memória — funciona no `npm run dev`, mas os dados somem quando o servidor reinicia. É útil só para testar o visual.

## Deploy no Vercel (grátis)

1. **Suba o repositório** no GitHub.
2. No [vercel.com](https://vercel.com) → **Add New… → Project** → importe o repo.
   - Framework: *Next.js* (detectado automaticamente).
   - Clique em **Deploy**.
3. **Conecte o banco (Upstash Redis)** — etapa crucial para os pedidos persistirem:
   - Abra o projeto → aba **Storage** → **Create Database**.
   - Escolha **Upstash → Redis** → plano **Free**.
   - Selecione o projeto ao qual conectar. O Vercel injeta as variáveis
     `KV_REST_API_URL` e `KV_REST_API_TOKEN` automaticamente.
4. **Redeploy** o projeto (aba Deployments → … → Redeploy) para que as novas
   variáveis sejam carregadas.
5. Pronto. Compartilhe a URL principal com o pessoal da festa e a URL
   `/artista` só com a banda.

### Free tier

O plano free do Upstash Redis (via Vercel) oferece 10.000 comandos/dia e
256 MB de storage — mais do que suficiente para uma festa.

## Paleta

Inspirada no convite: verde sage, rosa antigo, off-white, com tipografia serif
elegante (Cormorant Garamond) e toque manuscrito (Great Vibes).

## Checklist rápido antes da festa

- [ ] Deploy feito no Vercel
- [ ] Upstash Redis conectado (Storage → Marketplace)
- [ ] Redeploy após conectar o banco
- [ ] Testar `/` enviando um pedido
- [ ] Testar `/artista` recebendo o pedido (em outro celular)
- [ ] (Opcional) Renomear a pasta `/artista` para algo só a banda saber
- [ ] Gerar um QR code da URL pública para colar nas mesas
