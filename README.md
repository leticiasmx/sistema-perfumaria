# S&A Perfumaria — Front-end (loja virtual + painel da vendedora)

Front-end em **React 19 + TypeScript + Vite + Tailwind CSS v4**, com React Router, Axios, Recharts e Lucide React.
O back-end é a **API Java Spring Boot existente**: este projeto não cria back-end, banco de dados nem regras de negócio.

> ⚠️ **Status da integração:** o código do back-end não estava disponível durante o desenvolvimento.
> Todos os endpoints e formatos de dados são **provisórios** e estão concentrados em dois arquivos
> (veja "Conectando à API Java"). Nada foi apresentado como integrado sem estar.

---

## Como rodar

```bash
npm install
cp .env.example .env        # ajuste VITE_API_URL e o WhatsApp
npm run dev                 # http://localhost:5173
npm run build               # gera dist/
```

### Modo demonstração (dados fictícios)

Para navegar pelo sistema sem a API, defina `VITE_USE_MOCKS=true` no `.env`.
Uma faixa escura no topo avisa que os dados são fictícios. Login de demonstração: qualquer e-mail + senha `demo123`.

Os mocks ficam isolados em `src/mocks/` e são injetados como *adapter* do Axios em `src/main.tsx`.
Os serviços não sabem que os mocks existem. **Para remover:** apague `src/mocks/` e o bloco marcado em `src/main.tsx`.

---

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `VITE_API_URL` | URL base da API Java (padrão `http://localhost:8080`) |
| `VITE_USE_MOCKS` | `true` liga os dados fictícios (só para desenvolvimento) |
| `VITE_STORE_NAME` / `VITE_STORE_TAGLINE` | Nome e frase da loja |
| `VITE_WHATSAPP_NUMBER` | WhatsApp da vendedora, só dígitos com DDI (ex.: `5511999999999`). Sem ele, os botões de WhatsApp da loja ficam ocultos |
| `VITE_INSTAGRAM_URL` / `VITE_FACEBOOK_URL` | Redes sociais do rodapé (o ícone só aparece se preenchido) |
| `VITE_HERO_IMAGE_URL` | Foto opcional do banner principal |

---

## Conectando à API Java — checklist

1. **`src/config/endpoints.ts`**: confira cada caminho com os `@RestController` / `@RequestMapping` reais.
2. **`src/interfaces/index.ts`**: alinhe cada interface com o DTO Java correspondente. Os nomes dos campos devem ser **idênticos** ao JSON da API.
3. **Autenticação** (`src/services/api.ts` e `authService.ts`): o padrão assumido é `POST /auth/login` → `{ token, user? }` com `Authorization: Bearer <token>`.
   Se a API usar sessão/cookie, troque o interceptor por `withCredentials: true`. Um 401 encerra a sessão automaticamente.
4. **Paginação**: os serviços aceitam tanto lista simples quanto `Page<T>` do Spring (`asList()` em `api.ts`).
5. **Erros**: `utils/errors.ts` lê `message`, `error`, `detail` ou `title` do corpo da resposta (formatos comuns do Spring).
6. **Formas de pagamento e parcelas** (`src/config/store.ts`): lista provisória. Se a API expuser esses dados, troque por uma chamada de serviço.
7. **Dashboard** (`dashboardService.ts`): assume um endpoint agregado `GET /dashboard`. Se ele não existir, componha a partir dos demais serviços.
8. **Exportação de relatórios**: o botão chama `GET /reports/{tipo}/export?format=csv`. Se a API não exportar, uma mensagem informa que a exportação está indisponível.
9. **CORS**: libere a origem do front no Spring (`@CrossOrigin` ou `CorsConfigurationSource`).

### Endpoints esperados (provisórios)

| Módulo | Chamadas |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Produtos | `GET/POST /products`, `GET/PUT/DELETE /products/{id}`, `POST /products/{id}/image` (multipart `file`) |
| Marcas / Categorias | `GET/POST /brands`, `PUT/DELETE /brands/{id}` · idem `/categories` |
| Clientes | `GET /customers?search=`, `GET /customers/phone/{telefone}` (404 = cliente novo), `GET /customers/{id}/orders`, `GET /customers/birthdays?month=` |
| Pedidos | `POST /orders` (público), `GET /orders?status&from&to`, `GET /orders/{id}`, `PATCH /orders/{id}/status`, `PATCH /orders/{id}/cancel`, `GET /orders/{id}/history` |
| Estoque | `GET /stock`, `GET /stock/low`, `GET /stock/movements`, `POST /stock/entries` |
| Financeiro | `GET /financial/summary`, `GET /financial/monthly`, `GET/POST /financial/revenues`, `GET/POST /financial/expenses` |
| Parcelas | `GET /installments?status=`, `PATCH /installments/{id}/pay` |
| Cupons | `GET/POST /coupons`, `PUT/DELETE /coupons/{id}`, `POST /coupons/validate` (público) |
| Promoções | `GET/POST /promotions`, `PUT/DELETE /promotions/{id}` |
| Dashboard | `GET /dashboard?from&to` |
| Relatórios | `GET /reports/{sales|financial|top-products|stock|customers|installments}`, `GET /reports/{tipo}/export` |

---

## Regras de negócio: o que fica no back-end

O front **não recalcula** regras do sistema:
- **Total do pedido, desconto do cupom e parcelas**: vêm da API. O carrinho mostra um subtotal estimado e deixa claro que o valor final é confirmado ao registrar o pedido.
- **Validação de cupom**: `POST /coupons/validate`. Qualquer mudança no carrinho invalida o cupom aplicado.
- **Baixa de estoque, geração de parcelas e cancelamento**: feitos pela API. O front só envia a ação.
- **Status de parcela** (`PAGA`, `EM_ABERTO`, `VENCIDA`): vem da API. A aba "Próximas do vencimento" é apenas um recorte visual (`DUE_SOON_DAYS` em `config/store.ts`).

Ficam no front só as validações de formulário (campos obrigatórios, formatos) e a ordenação/recorte de exibição.

---

## Estrutura

```
src/
├── components/
│   ├── ui/          # Button, Input/Select/Textarea, Modal, DataTable, Tabs, Badge, StatCard, estados (loading/vazio/erro)…
│   ├── store/       # Header, Footer, ProductCard, PriceTag, botão flutuante do WhatsApp
│   └── charts/      # Gráficos Recharts (paleta validada para daltonismo)
├── config/          # env.ts, endpoints.ts (⚠️ provisório), store.ts (pagamentos)
├── contexts/        # AuthContext, CartContext (persistido no localStorage), ToastContext
├── hooks/           # useAsync (loading/erro/recarga), useDebounce, useDocumentTitle
├── interfaces/      # Tipos dos DTOs (⚠️ provisório)
├── layouts/         # StoreLayout, AdminLayout
├── mocks/           # 🧪 Dados fictícios — removível
├── pages/
│   ├── store/       # Home, Catálogo, Produto, Sacola, Checkout, Confirmação, 404
│   └── admin/       # Login, Dashboard, Produtos, Marcas/Categorias, Estoque, Pedidos,
│                    # Clientes, Financeiro, Parcelas, Cupons/Promoções, Relatórios
├── routes/          # AppRoutes (lazy loading), ProtectedRoute
├── services/        # api.ts (Axios único + interceptors) e um serviço por módulo
└── utils/           # formatação BRL/datas/telefone, WhatsApp, status, erros
```

## Rotas

**Loja:** `/` · `/catalogo` (`?q=`, `?marca=`, `?categoria=`, `?promo=1`) · `/produto/:id` · `/carrinho` · `/finalizar` · `/pedido/confirmado`
**Painel:** `/admin/login` · `/admin` · `/admin/produtos` · `/admin/marcas-categorias` · `/admin/estoque` · `/admin/pedidos` · `/admin/clientes` · `/admin/financeiro` · `/admin/parcelas` · `/admin/cupons` · `/admin/relatorios`

## Identidade visual

Paleta em `src/index.css` (`@theme`): vinho `#8B0000` / `#A6192E` / `#C03945`, dourado `#D4AF37` / `#E8D9A8`, fundo `#FAF8F5`, texto `#292323`.
Títulos em **Cormorant Garamond**, textos em **Manrope**. Nos gráficos, o dourado escuro `#B8860B` substitui o `#D4AF37` porque tem contraste suficiente sobre fundo branco.

