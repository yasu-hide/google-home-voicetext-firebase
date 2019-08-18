# google-home-voicetext-firebase
[sikkimtemiさん](https://github.com/sikkimtemi)の[google-home-voicetext](https://github.com/sikkimtemi/google-home-voicetext)のFirebase連携の再実装です。

Cloud Firestoreに書き込んだ内容を、Google Homeに喋らせる仕組みです。

[google-home-voicetext-server](https://github.com/yasu-hide/google-home-voicetext-server)と合わせて使用できます。

# 起動時に設定できる項目 (環境変数)
## SERVER_ADDRESS (必須)
google-home-voicetext-serverが起動しているサーバのIPアドレスです。

```
export SERVER_ADDRESS=192.168.20.140
```

## DEVICE_ADDRESS (必須)
喋らせたいGoogle HomeのIPアドレスです。

```
export DEVICE_ADDRESS=192.168.20.200
```

## FIREBASE_CREDENTIAL (必須)
サービスアカウントの認証情報ファイル(serviiceAccountKey.json)の場所を指定します。

詳しい内容は、[Cloud Firestore を使ってみる](https://firebase.google.com/docs/firestore/quickstart?hl=ja)を参照してください。

```
export FIREBASE_CREDENTIAL=/tmp/cred/serviceAccountKey.json
```

## SERVER_PORT (任意)
google-home-voicetext-serverのポート番号です。

デフォルトは __8080__ です。

```
export SERVER_PORT=80
```

## FIREBASE_DOCPATH (任意)
Firebase Cloud Firestoreのドキュメントパスを指定できます。

デフォルトは `/googlehome/chant` です。

```
export FIREBASE_DOCPATH=/googlehome/voicetext
```

# k8s
## Secret事前準備 (prepare)
認証情報やデータベースURLはシークレットに保存します。
```
$ kubectl create secret generic google-home-voicetext-firebase \
  --from-file=firebase-credential=./serviceAccountKey.json
```

## ConfigMap編集
パラメータを編集します。
```
vi k8s-google-home-voicetext-firebase.yml
```

## 適用 (apply)
```
$ kubectl apply -f k8s-google-home-voicetext-firebase.yml
```

# docker-compose
## 環境設定ファイル準備 (.env)
パラメータを編集します。
```
$ vi .env
```

## 起動 (up)
```
$ docker-compose up -d
```
