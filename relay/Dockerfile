FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json server.js dedicated-server.js tracked-protocol.js gm-commands.js ai-orders-contract.js scenario-contract.js vehicle-control-contract.js approval-policy.js ./
USER node
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
