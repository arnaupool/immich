# ImageGenius' all-in-one Immich with the web replaced by this fork's (360 viewer).
# Built by .github/workflows/360-image.yml; BASE_IMAGE is pinned by digest there.
ARG BASE_IMAGE=ghcr.io/imagegenius/immich:3.3.5

FROM node:24.22.1-bookworm-slim AS web
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  CI=1
RUN npm install --global corepack@latest && corepack enable pnpm
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .pnpmfile.cjs ./
COPY packages/sdk/package.json packages/sdk/package.json
COPY web/package.json web/package.json
RUN pnpm --filter immich-web... install --frozen-lockfile

COPY packages/sdk packages/sdk/
COPY i18n i18n/
COPY web web/
ARG BUILD_ID
ENV IMMICH_BUILD=${BUILD_ID}
RUN pnpm --filter @immich/sdk build && pnpm --filter immich-web build

FROM ${BASE_IMAGE}
RUN rm -rf /app/immich/data/www
COPY --from=web /usr/src/app/web/build /app/immich/data/www
