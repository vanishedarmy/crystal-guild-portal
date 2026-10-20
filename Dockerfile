FROM node:22-alpine AS frontend-build

WORKDIR /build/frontend
# Copy the manifest/config first so dependency installation can be cached.
COPY frontend/package*.json frontend/.npmrc ./
# Resolve the pinned platform-native Vite/Rolldown dependencies in this Linux build.
RUN npm ci --include=dev --no-audit --no-fund
COPY ARTWORK_V197_CHECKSUMS.json /build/ARTWORK_V197_CHECKSUMS.json
COPY frontend/ ./
RUN node scripts/verify-artwork-assets.mjs --source && npm run build && node scripts/verify-artwork-assets.mjs --dist

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOSTED_PORTAL_HOST=0.0.0.0 \
    HOSTED_PORTAL_PORT=8080 \
    HOSTED_PORTAL_STATIC_DIR=frontend/dist

WORKDIR /app
COPY crystal_guild /app/crystal_guild
COPY run_hosted_portal.py /app/run_hosted_portal.py
COPY --from=frontend-build /build/frontend/dist /app/frontend/dist
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import os,urllib.request; p=os.getenv('PORT',os.getenv('HOSTED_PORTAL_PORT','8080')); urllib.request.urlopen('http://127.0.0.1:'+p+'/api/health',timeout=3)"
CMD ["python", "run_hosted_portal.py"]
