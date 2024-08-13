FROM registry.access.redhat.com/ubi9/nodejs-20 AS Builder

# Create app directory
WORKDIR /tmp

USER root
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY src/package*.json ./


# update the base image
RUN npm install && npm audit fix --force
# If you are building your code for production
# RUN npm ci --only=production

FROM registry.access.redhat.com/ubi9/nodejs-20-minimal

WORKDIR /app

# Bundle app source
COPY --from=Builder --chown=1001:0 /tmp .

COPY src .

USER 1001

EXPOSE 8080

CMD [ "node", "app.js" ]