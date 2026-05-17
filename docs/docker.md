# Docker Deployment

This fork publishes Docker images for `seanime-i18n` on GHCR.

## Current release-preparation tag

The Docker image tag prepared for the upstream `v3.8.2` sync is:

```yaml
image: ghcr.io/8tnomasu/seanime-i18n:v3.8.2-i18n.1
```

Using `latest` is supported, but fixed version tags are recommended for production and homelab deployments.

During the PR stage for `v3.8.2-i18n.1`, the tag above is the intended release target. It will not exist until the release stage publishes the GitHub Release and Docker image.

## Container layout

The image keeps the existing Seanime homelab paths compatible:

- config directory inside the container: `/home/seanime/.config/Seanime`
- app binary path inside the container: `/app/seanime`
- media library mount point inside the container: `/anime`
- downloads mount point inside the container: `/downloads`
- default exposed port: `43211`

## FFmpeg / FFprobe

The official Docker image includes FFmpeg and FFprobe in the final runtime image.

- Browser-based mediastream transcoding playback works without installing FFmpeg on the host.
- If you deploy a non-official image, make sure `ffmpeg` and `ffprobe` are available in the runtime environment.

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

## Existing homelab volume compatibility

If you are already using:

- `/opt/seanime/config:/home/seanime/.config/Seanime`
- `/mnt/media/anime:/anime`
- `/mnt/media/downloads:/downloads`

you can keep the same container-side paths and swap the image without moving media files.

## Release binary source

The Docker image is built from release binaries published by this fork.

- release tag example: `v3.8.2-i18n.1`
- linux amd64 asset example: `seanime-3.8.2-i18n.1_Linux_x86_64.tar.gz`
- linux arm64 asset example: `seanime-3.8.2-i18n.1_Linux_arm64.tar.gz`

## Update checks

Web UI and updater release checks in this fork should follow:

- GitHub repository: `8tnomasu/seanime-i18n`

They should not follow upstream Seanime releases for this fork's runtime, Docker, playback, or localization fixes.
