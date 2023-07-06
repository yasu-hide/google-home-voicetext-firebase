FROM node:gallium-bullseye-slim
WORKDIR /tmp
COPY package.json /tmp/package.json
RUN npm config set unsafe-perm true \
    && npm update -y -g npm \
    && npm install \
    && npm config set unsafe-perm false
COPY main.js /tmp/main.js
RUN mkdir /tmp/cred && chmod 0700 /tmp/cred
ENV FIREBASE_CREDENTIAL "/tmp/cred/serviceAccountKey.json"
RUN touch ${FIREBASE_CREDENTIAL}
ENTRYPOINT ["node"]
CMD ["/tmp/main.js"]