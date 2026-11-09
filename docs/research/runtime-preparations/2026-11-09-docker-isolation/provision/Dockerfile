FROM node:22-bookworm-slim@sha256:5ec23b7c622b00547753bc6ffd78085dd868a68aeb41c8e0a1418f033e13d96d
RUN npm install --global --ignore-scripts @openai/codex@0.167.0 && npm view @openai/codex@0.167.0 dist.integrity && codex --version
COPY probe.mjs /opt/probe.mjs
RUN mkdir /workspace && chmod 1777 /workspace
USER 1000:1000
ENTRYPOINT ["node", "/opt/probe.mjs"]
