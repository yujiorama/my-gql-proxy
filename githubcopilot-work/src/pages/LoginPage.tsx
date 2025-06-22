import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/github");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`ログイン失敗: ${res.status} ${text}`);
      }
      navigate("/mypage");
    } catch (e: any) {
      setError(e?.message || "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>ログインページ</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "ログイン中..." : "GitHubでログイン"}
      </button>
    </div>
  );
};

export default LoginPage;
