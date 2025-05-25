# my-gql-proxy

個人用のGraphQLクライアントWebアプリケーション。

## 機能一覧

- GitHub認証でログインできる
- マイページでは、GraphQLサーバーを登録できる
- マイページでは、登録したGraphQLサーバーを一覧表示できる
- マイページでは、登録したGraphQLサーバーの項目を変更できる
- マイページでは、登録したGraphQLサーバーを削除できる
- マイページでGraphQLサーバーを指定すると、新しいリクエストを入力できる
- マイページでGraphQLサーバーを指定して新しいリクエストを入力すると、リクエストを実行できる
- マイページでGraphQLサーバーを指定して新しいリクエストを入力してリクエストを実行すると、レスポンスを表示できる
- マイページでGraphQLサーバーを指定すると、過去に実行したリクエストとレスポンスの対の履歴を一覧表示できる
- マイページでGraphQLサーバーを指定して過去に実行したリクエストとレスポンスの対の履歴を指定すると、リクエストとレスポンスを表示できる

## アーキテクチャ

### 構成要素

- **Webアプリケーション（my-gql-proxy）**
  - Next.js 等で実装されたサーバー

- **データベース**
  - Cloud SQL（MySQL）
    （ユーザー情報・GraphQLサーバー情報・リクエスト/レスポンス履歴等を保存）

- **認証**
  - アプリ側でGitHub OAuth連携

- **シークレット管理**
  - Secret Manager（OAuthクライアントID/シークレット等の管理）

### システム全体像

```mermaid
graph TD
  U[ユーザー] --> CR["Cloud Run<br/>(my-gql-proxy)"]
  CR --> GH[GitHub]
  CR --> DB["Cloud SQL"]
  CR --> SM["Secret Manager"]
  CR --> GQL["任意のGraphQLサーバー"]
```

### 主な処理フロー

1. ユーザーが Web アプリにアクセス
2. GitHub認証でログイン
3. マイページでGraphQLサーバー情報を管理（登録・編集・削除・一覧）
4. 選択したGraphQLサーバーに対してリクエストを作成・実行、レスポンスを表示
5. リクエスト/レスポンス履歴をDBに保存し、一覧・個別表示

### デプロイ・運用

- Docker イメージをビルドし Cloud Run へデプロイ
- Cloud BuildやGitHub ActionsでCI/CD自動化可能
- Cloud Runの環境変数やSecret Managerで認証情報などを安全に管理
- 必要に応じて、VPCやIAM権限を設定しセキュリティを担保

## GitHub Copilot の提案

TBD

## Gemini の提案

> このリポジトリのreadmeに書いてある機能を実装して、変更PRを作成して欲しい。
> 
https://g.co/gemini/share/f00307ea52b7

## Google AI Studioの提案

Google AI Studio によって提案された、このリポジトリのコア機能（GitHub認証でログインし、登録したURLに指定したGraphQLリクエストを送信し、レスポンスを表示できる）を実現するためのミニマムなアーキテクチャ案です。

### 1. 主要コンポーネント

1.  **フロントエンド (Web UI):**
    *   **役割:** ユーザーインターフェースの提供、ユーザー入力の受付、バックエンドAPIとの通信。
    *   **機能:**
        *   GitHubログインボタン。
        *   ログイン後:
            *   GraphQLエンドポイントURLの入力フィールド。
            *   GraphQLクエリ入力エリア。
            *   GraphQL変数入力エリア (JSON形式)。
            *   (オプション) カスタムHTTPヘッダー入力フィールド。
            *   リクエスト送信ボタン。
            *   GraphQLレスポンス表示エリア。
            *   ログアウト機能。
    *   **技術スタック例:** React, Vue.js, Next.js, SvelteKit など + HTML/CSS/JavaScript。

2.  **バックエンド (APIサーバー):**
    *   **役割:** 認証処理、フロントエンドからのリクエスト仲介、外部GraphQLサービスへのリクエスト送信。
    *   **機能:**
        *   **GitHub OAuth認証エンドポイント:** `/auth/github`, `/auth/github/callback`
        *   **GraphQLリクエストプロキシエンドポイント (認証必須):** 例: `POST /api/execute-graphql`
            *   フロントエンドから `targetUrl`, `query`, `variables`, `headers` を受け取り、ターゲットにリクエストを送信。
        *   **ユーザーセッション/認証状態確認エンドポイント:** 例: `GET /api/me`
        *   **ログアウトエンドポイント:** 例: `POST /api/logout`
    *   **技術スタック例:** Node.js + Express.js / Fastify / NestJS など。

3.  **設定管理:**
    *   `config.yaml` (または環境変数) で GitHub OAuth情報、セッションキーなどを管理。

### 2. データストア (オプション、主にセッション管理用)

*   **Redis / データベース:** セッションストアとして利用可能。

### 3. リクエスト処理フロー (概要)

#### 3.1 ユーザーログインフロー

```mermaid
sequenceDiagram
    participant UserBrowser as フロントエンド (ブラウザ)
    participant AppBackend as バックエンド (APIサーバー)
    participant GitHub

    UserBrowser->>AppBackend: 1. 「GitHubでログイン」クリック
    AppBackend->>GitHub: 2. GitHub OAuth認証へリダイレクト
    GitHub-->>UserBrowser: 3. GitHubログイン画面表示
    UserBrowser->>GitHub: 4. ユーザーが認証情報入力・承認
    GitHub-->>UserBrowser: 5. AppBackendのコールバックURLへリダイレクト (with code)
    UserBrowser->>AppBackend: 6. コールバックURLへアクセス
    AppBackend->>GitHub: 7. codeとclient_secretを送信しアクセストークン要求
    GitHub-->>AppBackend: 8. アクセストークン返却
    AppBackend->>GitHub: 9. アクセストークンを使いユーザー情報要求
    GitHub-->>AppBackend: 10. ユーザー情報返却
    AppBackend->>AppBackend: 11. セッション作成 (またはJWT発行)
    AppBackend-->>UserBrowser: 12. ログイン成功、メインページへリダイレクト
```

#### 3.2 GraphQLリクエスト実行フロー

```mermaid
sequenceDiagram
    participant UserBrowser as フロントエンド (ブラウザ)
    participant AppBackend as バックエンド (APIサーバー)
    participant TargetGraphQLService as ターゲットGraphQLサービス

    UserBrowser->>AppBackend: 1. GraphQLリクエスト情報送信 (認証情報と共に)
    AppBackend->>AppBackend: 2. 認証確認
    alt 認証成功
        AppBackend->>TargetGraphQLService: 3. GraphQLリクエスト送信
        TargetGraphQLService-->>AppBackend: 4. GraphQLレスポンス
        AppBackend-->>UserBrowser: 5. レスポンスを転送
    else 認証失敗
        AppBackend-->>UserBrowser: 401 Unauthorized
    end
    UserBrowser->>UserBrowser: 6. レスポンス表示
```

### 4. メリット

- シンプル: 実装が比較的容易。
- セキュア: ユーザー認証を導入。
- 柔軟性: 任意のGraphQLエンドポイントに対応。
