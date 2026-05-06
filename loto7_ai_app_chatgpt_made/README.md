# ロト7 AI分析・予測ダッシュボード

Flask / Chart.js / Bootstrap ダークテーマで作成した、ロト7の当選番号を分析・シミュレーションするWebアプリです。

> **重要**  
> ロト7は完全ランダムな抽選です。  
> 本アプリの分析・AI予測は、当選を保証するものではありません。娯楽・研究・学習目的で利用してください。

---

## 1. 主な機能

### データ自動取得

アプリ起動時に以下の順番でCSV取得を試みます。

1. KYO's LOTO7 のCSVデータ
2. loto-life.net 側のCSV候補
3. どちらも失敗した場合は `data/sample_loto7.csv` で起動

画面上には以下を表示します。

- 取得状況
- 最終更新日時
- データ件数
- 取得元
- 取得失敗時のエラーメッセージ

画面右上の **データ更新** ボタンから手動更新も可能です。

---

## 2. 画面タブ構成

### タブ1：基礎統計分析

- 全数字 1〜37 の出現頻度ランキング
- ホットナンバー表示
- コールドナンバー表示
- よく一緒に出るペアTOP10
- 合計値分析
- 奇数・偶数バランス分析
- 位置別出現分析
- スキップ分析
- 直近10回の当選番号テーブル

### タブ2：高度数学分析

- デルタ数値分析
- フーリエ変換
- エントロピー分析
- カオス理論風の非線形パターン分析
- グラフ理論による共起ネットワーク分析

### タブ3：AI予測エンジン

- RandomForest
- XGBoost
- LSTM
- マルコフ連鎖
- 簡易HMM
- ベイズ推定
- 遺伝的アルゴリズム
- PCA＋クラスタリング
- 強化学習風モデル
- アンサンブル学習

### タブ4：確率シミュレーション

- モンテカルロシミュレーション
- ホイーリングシステム
- マルコフ連鎖シミュレーション

### タブ5：的中シミュレーター

- 任意の7数字の過去照合
- 投資額と概算当選金額の収支計算
- ホイーリング買い目の一括検証

---

## 3. 初心者向け起動手順

### ステップ1：フォルダを開く

ターミナルで、このアプリのフォルダへ移動します。

```bash
cd loto7_ai_app
```

### ステップ2：仮想環境を作成する

Mac / Windows 共通で、まず仮想環境を作ります。

```bash
python -m venv .venv
```

Mac の場合：

```bash
source .venv/bin/activate
```

Windows の場合：

```bash
.venv\Scripts\activate
```

### ステップ3：必要ライブラリをインストールする

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

TensorFlow のインストールでエラーが出る場合は、いったん以下の軽量構成で起動してください。

```bash
pip install Flask pandas numpy requests beautifulsoup4 scikit-learn networkx xgboost
```

このアプリは TensorFlow が入っていなくても、LSTM部分を代替ロジックで動かします。

### ステップ4：アプリを起動する

```bash
python app.py
```

以下のような表示が出れば成功です。

```text
Running on http://127.0.0.1:5000
```

ブラウザで以下を開いてください。

```text
http://127.0.0.1:5000
```

---

## 4. ファイル構成

```text
loto7_ai_app/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── data/
    └── sample_loto7.csv
```

---

## 5. よくあるエラーと対処法

### Q1. `ModuleNotFoundError: No module named 'flask'` と出ます

A. 必要ライブラリが入っていません。以下を実行してください。

```bash
pip install -r requirements.txt
```

---

### Q2. TensorFlow のインストールで失敗します

A. PythonのバージョンやMacのCPU環境によってTensorFlowは失敗しやすいです。  
本アプリは TensorFlow がなくても動くようにしてあります。

まずは以下の軽量構成で起動してください。

```bash
pip install Flask pandas numpy requests beautifulsoup4 scikit-learn networkx xgboost
python app.py
```

---

### Q3. 外部CSVが取得できません

A. サイト側のアクセス制限、URL変更、通信障害の可能性があります。  
その場合でも `data/sample_loto7.csv` で起動します。

画面右上の **データ更新** ボタンで再取得できます。

---

### Q4. グラフが表示されません

A. インターネット接続がない場合、Chart.js / Bootstrap のCDNが読めない可能性があります。  
ネット接続を確認してください。

---

### Q5. 画面が重いです

A. モンテカルロ100万回やAI計算は重い処理です。  
本アプリではバックグラウンド実行にしていますが、古いPCでは時間がかかる場合があります。

軽くしたい場合は `static/js/main.js` の以下の数値を減らしてください。

```javascript
body: JSON.stringify({draws:1000000})
```

例：

```javascript
body: JSON.stringify({draws:100000})
```

---

## 6. 注意事項

- KYO's LOTO7等の外部サイトのデータ利用条件を確認し、個人利用の範囲で利用してください。
- 取得元サイトのHTMLやCSV仕様が変更されると、自動取得が失敗する場合があります。
- ロト7はランダム抽選であり、過去データから未来の当選番号を確実に予測することはできません。
- 投資・購入判断は自己責任で行ってください。

---

## 7. Claude Codeに貼り付け後の運用

1. このフォルダ一式を作成
2. READMEの手順通りに起動して動作確認
3. エラーが出たら、エラー文をそのまま貼り付けて修正
