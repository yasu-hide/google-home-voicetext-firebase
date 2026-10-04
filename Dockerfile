FROM dhi.io/node:22-alpine-sfw-dev

WORKDIR /app
COPY package.json package-lock.json /app/
RUN node -p 'JSON.stringify({ arch: process.arch, version: process.version })' \
	&& npm ci --omit=dev --loglevel verbose
COPY main.js /app/main.js
COPY lib/ /app/lib/
RUN mkdir /app/cred && chmod 0755 /app/cred
ENV FIREBASE_CREDENTIAL "/app/cred/serviceAccountKey.json"
RUN touch ${FIREBASE_CREDENTIAL}

ENTRYPOINT ["node"]
CMD ["/app/main.js"]
