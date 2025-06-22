/* eslint-disable */
import { http, HttpResponse, delay } from 'msw';

let servers = [
  { id: '1', name: 'GitHub GraphQL', url: 'https://api.github.com/graphql' },
];
let history = [
  {
    id: 'h1',
    serverId: '1',
    request: '{ viewer { login } }',
    response: '{ "data": { "viewer": { "login": "mockuser" } } }',
    createdAt: new Date().toISOString(),
  },
];
// クッキーで認証状態を管理
const isAuthed = () => {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim() === 'isAuthenticated=true');
};

export const handlers = [
  // GitHub認証モック
  http.get('/api/auth/github', async (_, res, ctx) => {
    await delay(100);
    return res(ctx.json({ success: true }));
  }),
  http.get('/api/auth/me', async (_, res, ctx) => {
    await delay(100);
    return res(ctx.json({ user: { name: 'mockuser' } }));
  }),
  http.post('/api/auth/logout', async (_, res, ctx) => {
    await delay(100);
    return res(ctx.status(200));
  }),
  // サーバー一覧取得
  http.get('/api/servers', async (_, res, ctx) => {
    await delay(100);
    return res(ctx.json(servers));
  }),
  // サーバー登録
  http.post('/api/servers', async ({ request }, res, ctx) => {
    const body = (await request.json()) as Record<string, any>;
    const name = typeof body?.name === 'string' ? body.name : '';
    const url = typeof body?.url === 'string' ? body.url : '';
    const newServer = { id: String(Date.now()), name, url };
    servers.push(newServer);
    await delay(100);
    return res(ctx.status(201), ctx.json(newServer));
  }),
  // サーバー編集
  http.put('/api/servers/:id', async ({ params, request }, res, ctx) => {
    const { id } = params;
    const body = (await request.json()) as Record<string, any>;
    servers = servers.map(s => (s.id === id ? { ...s, ...(body || {}) } : s));
    await delay(100);
    return res(ctx.json(servers.find(s => s.id === id)));
  }),
  // サーバー削除
  http.delete('/api/servers/:id', async ({ params }, res, ctx) => {
    const { id } = params;
    servers = servers.filter(s => s.id !== id);
    await delay(100);
    return res(ctx.status(204));
  }),
  // 履歴一覧取得
  http.get('/api/history', async (_, res, ctx) => {
    await delay(100);
    return res(ctx.json(history));
  }),
  // 履歴個別取得
  http.get('/api/history/:id', async ({ params }, res, ctx) => {
    const { id } = params;
    const item = history.find(h => h.id === id);
    if (!item) return res(ctx.status(404));
    await delay(100);
    return res(ctx.json(item));
  }),
  // GraphQLリクエスト実行
  http.post('/api/graphql', async ({ request }, res, ctx) => {
    const body = (await request.json()) as Record<string, any>;
    const query = body?.query ?? '';
    const serverId = body?.serverId ?? '';
    const mockResponse = { data: { echo: query } };
    // 履歴追加
    const newHistory = {
      id: String(Date.now()),
      serverId,
      request: query,
      response: JSON.stringify(mockResponse),
      createdAt: new Date().toISOString(),
    };
    history.push(newHistory);
    await delay(100);
    return res(ctx.json(mockResponse));
  }),
];
/* eslint-enable */
