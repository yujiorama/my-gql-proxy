import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newServer, setNewServer] = useState({ name: '', url: '' });
  const [editServerId, setEditServerId] = useState<string | null>(null);
  const [editServer, setEditServer] = useState({ name: '', url: '' });
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [requesting, setRequesting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");
  const [historyDetail, setHistoryDetail] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          navigate("/");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (e) {
        setError("認証情報の取得に失敗しました");
      }
    };
    fetchMe();
  }, [navigate]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch("/api/servers");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setServers(data);
      } catch (e) {
        setError("サーバー一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, []);

  // サーバー追加
  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServer),
      });
      if (!res.ok) throw new Error();
      const added = await res.json();
      setServers([...servers, added]);
      setNewServer({ name: '', url: '' });
    } catch {
      setError('サーバー追加に失敗しました');
    }
  };

  // サーバー編集開始
  const startEdit = (s: any) => {
    setEditServerId(s.id);
    setEditServer({ name: s.name, url: s.url });
  };

  // サーバー編集保存
  const handleEditServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editServerId) return;
    setError("");
    try {
      const res = await fetch(`/api/servers/${editServerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editServer),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setServers(servers.map(s => s.id === editServerId ? updated : s));
      setEditServerId(null);
      setEditServer({ name: '', url: '' });
    } catch {
      setError('サーバー編集に失敗しました');
    }
  };

  // サーバー削除
  const handleDeleteServer = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/servers/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error();
      setServers(servers.filter(s => s.id !== id));
    } catch {
      setError('サーバー削除に失敗しました');
    }
  };

  // GraphQLリクエスト送信
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResponse(null);
    setRequesting(true);
    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: selectedServerId, query }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResponse(data);
    } catch {
      setError("リクエスト送信に失敗しました");
    } finally {
      setRequesting(false);
    }
  };

  // 履歴一覧取得
  useEffect(() => {
    if (!selectedServerId) {
      setHistory([]);
      setSelectedHistoryId("");
      setHistoryDetail(null);
      return;
    }
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        if (!res.ok) throw new Error();
        const data = await res.json();
        // サーバーIDで絞り込み
        setHistory(data.filter((h: any) => h.serverId === selectedServerId));
      } catch {
        setHistory([]);
      }
    };
    fetchHistory();
  }, [selectedServerId, response]);

  // 履歴詳細取得
  useEffect(() => {
    if (!selectedHistoryId) {
      setHistoryDetail(null);
      return;
    }
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/history/${selectedHistoryId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setHistoryDetail(data);
      } catch {
        setHistoryDetail(null);
      }
    };
    fetchDetail();
  }, [selectedHistoryId]);

  if (loading) return <div><h2>マイページ</h2>読み込み中...</div>;
  if (error) return <div><h2>マイページ</h2><span style={{ color: "red" }}>{error}</span></div>;

  return (
    <div>
      <h2>マイページ</h2>
      <div>ユーザー: {user?.name}</div>
      <div>
        <h3>GraphQLサーバー一覧</h3>
        <form onSubmit={handleAddServer} style={{ marginBottom: 8 }}>
          <input
            type="text"
            placeholder="サーバー名"
            value={newServer.name}
            onChange={e => setNewServer({ ...newServer, name: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="エンドポイントURL"
            value={newServer.url}
            onChange={e => setNewServer({ ...newServer, url: e.target.value })}
            required
          />
          <button type="submit">追加</button>
        </form>
        <ul>
          {servers.map((s) => (
            <li key={s.id}>
              {editServerId === s.id ? (
                <form onSubmit={handleEditServer} style={{ display: 'inline' }}>
                  <input
                    type="text"
                    value={editServer.name}
                    onChange={e => setEditServer({ ...editServer, name: e.target.value })}
                    required
                  />
                  <input
                    type="url"
                    value={editServer.url}
                    onChange={e => setEditServer({ ...editServer, url: e.target.value })}
                    required
                  />
                  <button type="submit">保存</button>
                  <button type="button" onClick={() => setEditServerId(null)}>キャンセル</button>
                </form>
              ) : (
                <>
                  {s.name} ({s.url})
                  <button onClick={() => startEdit(s)}>編集</button>
                  <button onClick={() => handleDeleteServer(s.id)}>削除</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* サーバー選択とリクエスト送信フォーム */}
      <div style={{ marginTop: 32 }}>
        <h3>GraphQLリクエスト送信</h3>
        <form onSubmit={handleSendRequest}>
          <select
            value={selectedServerId}
            onChange={e => setSelectedServerId(e.target.value)}
            required
          >
            <option value="" disabled>サーバーを選択</option>
            {servers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <br />
          <textarea
            rows={6}
            cols={60}
            placeholder="GraphQLクエリを入力"
            value={query}
            onChange={e => setQuery(e.target.value)}
            required
            style={{ marginTop: 8 }}
          />
          <br />
          <button type="submit" disabled={requesting || !selectedServerId}>
            {requesting ? "送信中..." : "リクエスト送信"}
          </button>
        </form>
        {/* レスポンス表示 */}
        {response && (
          <div style={{ marginTop: 16 }}>
            <h4>レスポンス</h4>
            <pre style={{ background: '#eee', padding: 8 }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
      {/* 履歴一覧・詳細表示 */}
      <div style={{ marginTop: 32 }}>
        <h3>リクエスト履歴</h3>
        {history.length === 0 ? (
          <div>履歴がありません</div>
        ) : (
          <ul>
            {history.map(h => (
              <li key={h.id}>
                <button onClick={() => setSelectedHistoryId(h.id)} style={{ marginRight: 8 }}>
                  {new Date(h.createdAt).toLocaleString()} リクエスト
                </button>
                <span style={{ fontSize: '0.9em', color: '#888' }}>{h.request.slice(0, 30)}...</span>
              </li>
            ))}
          </ul>
        )}
        {/* 履歴詳細 */}
        {historyDetail && (
          <div style={{ marginTop: 16 }}>
            <h4>履歴詳細</h4>
            <div><b>リクエスト:</b></div>
            <pre style={{ background: '#eee', padding: 8 }}>{historyDetail.request}</pre>
            <div><b>レスポンス:</b></div>
            <pre style={{ background: '#eee', padding: 8 }}>{historyDetail.response}</pre>
          </div>
        )}
      </div>
      {/* 以降、サーバー管理・リクエスト・履歴のUI/処理を追加予定 */}
    </div>
  );
};

export default MyPage;
