# BuildTrack — Backend

API em Node.js + Express + PostgreSQL para o sistema BuildTrack.

## Estrutura

```
backend/
├── src/
│   ├── server.js              → ponto de entrada
│   ├── db.js                  → conexão com o PostgreSQL
│   ├── middlewares/
│   │   └── auth.middleware.js → verifica o token de login
│   ├── controllers/
│   │   ├── usuarios.controller.js
│   │   └── obras.controller.js
│   └── routes/
│       ├── usuarios.routes.js
│       └── obras.routes.js
├── .env.example
├── .gitignore
└── package.json
```

## Como rodar

### 1. Instalar as dependências

```bash
cd backend
npm install
```

### 2. Configurar o `.env`

Copie o exemplo e preencha com os dados do seu PostgreSQL (o mesmo banco `buildtrack` onde você já rodou o `schema.sql`):

```bash
cp .env.example .env
```

Abra o `.env` e edite:

```
DB_PASSWORD=a_senha_que_voce_criou_ao_instalar_o_postgres
```

O `JWT_SECRET` pode ser qualquer texto longo e aleatório — é usado pra "assinar" os tokens de login.

### 3. Rodar o servidor

```bash
npm run dev
```

Se aparecer `Servidor rodando em http://localhost:3000`, deu certo.

## Testando as rotas

### Criar uma conta

```bash
curl -X POST http://localhost:3000/usuarios/cadastro \
  -H "Content-Type: application/json" \
  -d '{"name":"Cauan Silva","email":"cauan@exemplo.com","password":"123456"}'
```

### Fazer login (retorna um token)

```bash
curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cauan@exemplo.com","password":"123456"}'
```

Guarde o `token` que voltar — ele é necessário pras rotas protegidas.

### Listar obras (não precisa de login)

```bash
curl http://localhost:3000/obras
```

### Criar uma obra (precisa de login — troque SEU_TOKEN)

```bash
curl -X POST http://localhost:3000/obras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Casa Jardim",
    "client": "João Silva",
    "city": "Porto Belo",
    "state": "SC",
    "responsible": "Eng. Carlos Mendes",
    "registrationNumber": "SC-123456",
    "startDate": "2026-08-05"
  }'
```

## O que já está pronto

- **Usuários**: cadastro (com senha criptografada), login (retorna token), buscar perfil
- **Obras**: listar todas, buscar uma, criar (exige login), atualizar (exige login)

## O que falta (próximos passos)

- Rotas de RDOs, Estrutura da obra, Equipe, Empresas terceirizadas, Equipamentos
- Conectar o frontend a essas rotas (trocar os dados fictícios dos `.js` por `fetch()`)
- Upload de fotos de verdade (hoje o RDO só guarda a foto na memória do navegador)
