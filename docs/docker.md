# Docker Deployment

This fork includes Docker deployment support that is designed to stay compatible with the existing Seanime homelab layout:

- config directory inside the container: `/home/seanime/.config/Seanime`
- app binary path inside the container: `/app/seanime`
- media library mount point inside the container: `/anime`
- downloads mount point inside the container: `/downloads`
- default exposed port: `43211`

The image is rootless-friendly and uses the `seanime` user by default. The example Compose file also keeps `user: "1000:1000"` so it remains close to a `latest-rootless` style deployment.

## Local build with Docker Compose

Build the image:

```bash
docker compose -f docker-compose.example.yml build
```

Start the container:

```bash
docker compose -f docker-compose.example.yml up -d
```

View logs:

```bash
docker logs -f seanime
```

Stop the stack:

```bash
docker compose -f docker-compose.example.yml down
```

## Container paths

When configuring Seanime inside the container, use:

- Anime / library path: `/anime`
- Downloads path: `/downloads`
- Config persistence on the host: `./config`

## Release binary source

The Docker image is built from release binaries published by this fork.

Current defaults:

- release tag: `v3.6.1-i18n.2`
- linux amd64 asset: `seanime-3.6.1_Linux_x86_64.tar.gz`
- linux arm64 asset: `seanime-3.6.1_Linux_arm64.tar.gz`

The Dockerfile uses `TARGETARCH` to select the correct Linux asset automatically.

## Existing homelab volume compatibility

If you are already using:

- `/opt/seanime/config:/home/seanime/.config/Seanime`
- `/mnt/media/anime:/anime`
- `/mnt/media/downloads:/downloads`

you can keep the same container-side paths and swap the image without moving your media files.

## Using GHCR instead of a local build

After the GHCR workflow publishes the image, you can switch from `build: .` to a prebuilt image such as:

```yaml
services:
  seanime:
    image: ghcr.io/8tnomasu/seanime-i18n:v3.6.1-i18n.2
```
