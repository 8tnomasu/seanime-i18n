# syntax=docker/dockerfile:1.7

ARG RELEASE_TAG=v3.6.1-i18n.1
ARG SEANIME_VERSION=3.6.1
ARG RELEASE_REPOSITORY=8tnomasu/seanime-i18n

FROM debian:bookworm-slim AS downloader

ARG TARGETARCH
ARG RELEASE_TAG
ARG SEANIME_VERSION
ARG RELEASE_REPOSITORY

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl tar \
    && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    build_arch="${TARGETARCH:-$(dpkg --print-architecture)}"; \
    case "${build_arch}" in \
        amd64) asset_arch="x86_64" ;; \
        arm64) asset_arch="arm64" ;; \
        *) echo "Unsupported target architecture: ${build_arch}" >&2; exit 1 ;; \
    esac; \
    asset="seanime-${SEANIME_VERSION}_Linux_${asset_arch}.tar.gz"; \
    url="https://github.com/${RELEASE_REPOSITORY}/releases/download/${RELEASE_TAG}/${asset}"; \
    mkdir -p /tmp/release /out; \
    curl -fL "${url}" -o /tmp/release/seanime.tar.gz; \
    tar -xzf /tmp/release/seanime.tar.gz -C /tmp/release; \
    test -f /tmp/release/seanime; \
    install -m 0755 /tmp/release/seanime /out/seanime

FROM debian:bookworm-slim

ARG UID=1000
ARG GID=1000

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid "${GID}" seanime \
    && useradd --uid "${UID}" --gid "${GID}" --create-home --home-dir /home/seanime --shell /usr/sbin/nologin seanime \
    && mkdir -p /app /home/seanime/.config/Seanime /anime /downloads

COPY --from=downloader /out/seanime /app/seanime

RUN chmod +x /app/seanime \
    && chown -R "${UID}:${GID}" /app /home/seanime /anime /downloads

ENV HOME=/home/seanime \
    XDG_CONFIG_HOME=/home/seanime/.config \
    SEANIME_SERVER_HOST=0.0.0.0 \
    SEANIME_SERVER_PORT=43211 \
    TZ=UTC

WORKDIR /app
USER seanime

EXPOSE 43211

CMD ["/app/seanime"]
