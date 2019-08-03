# kubernetes
## 事前準備 (prepare)
```
$ sed -i "s/DEVICE_ADDRESS: ''/DEVICE_ADDRESS: 'Google HomeのIPアドレス'/" k8s-google-home-voicetext-firebase.yml
$ kubectl create secret generic google-home-voicetext-firebase \
  --from-file=firebase-credential=./serviceAccountKey.json \
  --from-literal=FIRESTORE_URL=https://FIREBASE_PROJECTID.firebaseio.com/
```
## 適用 (apply)
```
$ kubectl apply -f k8s-google-home-voicetext-firebase.yml
```