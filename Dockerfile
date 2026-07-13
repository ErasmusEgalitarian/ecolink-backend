FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# GitHub → imagem. O volume do Coolify monta em /app/uploads e esconde a imagem;
# o entrypoint copia de .uploads-from-git para o volume na subida do container.
RUN mkdir -p uploads/content uploads/perfil uploads/locations /app/.uploads-from-git && \
    cp -a uploads/. /app/.uploads-from-git/ && \
    chmod +x docker/entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

USER root
ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["node", "server.js"]
