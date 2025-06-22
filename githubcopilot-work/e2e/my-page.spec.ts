import { test, expect } from '@playwright/test';

// E2E: マイページの主要機能

test.describe('マイページ E2E', () => {
  test('ログイン→サーバー追加→リクエスト送信→履歴確認', async ({ page }) => {
    // ログインページへ
    await page.goto('/');
    await page.getByRole('button', { name: 'GitHubでログイン' }).click();
    // スクリーンショット取得（デバッグ用）
    await page.screenshot({ path: 'test-results/before-mypage.png' });
    // エラー表示があれば内容を出力
    const errorText = await page.locator('div[style*="color: red"]').textContent();
    if (errorText) {
      console.log('Login error:', errorText);
    }
    // マイページ遷移
    await expect(page.getByText('マイページ')).toBeVisible({ timeout: 10000 });
    // サーバー追加
    await page.getByPlaceholder('サーバー名').fill('Test GQL');
    await page.getByPlaceholder('エンドポイントURL').fill('https://example.com/graphql');
    await page.getByRole('button', { name: '追加' }).click();
    await expect(page.getByText('Test GQL')).toBeVisible();
    // サーバー選択
    await page.getByRole('combobox').selectOption({ label: 'Test GQL' });
    // クエリ入力
    await page.getByPlaceholder('GraphQLクエリを入力').fill('{ hello }');
    await page.getByRole('button', { name: 'リクエスト送信' }).click();
    // レスポンス表示
    await expect(page.getByText('レスポンス')).toBeVisible();
    await expect(page.getByText('hello')).toBeVisible();
    // 履歴一覧に表示
    await expect(page.getByText(/リクエスト/)).toBeVisible();
    // 履歴詳細表示
    await page.getByRole('button', { name: /リクエスト/ }).first().click();
    await expect(page.getByText('履歴詳細')).toBeVisible();
    await expect(page.getByText('{ hello }')).toBeVisible();
  });
});
