FROM dhi.io/node:22-alpine-sfw-dev

WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci --omit=dev
COPY main.js /app/main.js
RUN mkdir /app/cred && chmod 0755 /app/cred
ENV FIREBASE_CREDENTIAL "/app/cred/serviceAccountKey.json"
RUN touch ${FIREBASE_CREDENTIAL}

ENTRYPOINT ["node"]
CMD ["/app/main.js"]
