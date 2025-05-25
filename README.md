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
  - Node.js 等で実装されたサーバー
  - フロントエンド（例: React, Next.js など）

- **データベース**
  - Cloud SQL（MySQL/PostgreSQL） または Firestore  
    （ユーザー情報・GraphQLサーバー情報・リクエスト/レスポンス履歴等を保存）

- **認証**
  - Firebase Authentication（GitHubプロバイダー）
  - またはアプリ側でGitHub OAuth連携

- **シークレット管理**
  - Secret Manager（OAuthクライアントID/シークレット等の管理）

### システム全体像

```mermaid
graph TD
  User[ユーザー] -- HTTPS --> CloudRun[Cloud Run (my-gql-proxy)]
  CloudRun -- 認証/OAuth --> GitHub
  CloudRun -- データ保存・取得 --> DB[(Cloud SQL<br/>または Firestore)]
  CloudRun -- シークレット参照 --> SecretManager[Secret Manager]
  CloudRun -- APIリクエスト --> GraphQLAPI[任意のGraphQLサーバー]
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

