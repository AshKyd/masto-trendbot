FROM node:22-alpine
ENV NODE_ENV production
ARG MASTODON_SERVER
ARG MASTODON_USER
ARG MASTODON_PASS
ARG ALLOWLISTED_SERVERS
ARG REJECTED_KEYWORDS
ARG REJECTED_KEYWORDS_CASE_SENSITIVE
ARG OVERRIDE_KEYWORDS
ARG CRON
WORKDIR /usr/src/app
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
USER node
COPY . .
CMD npm start