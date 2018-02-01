FROM node
COPY ./package.json /app/package.json
COPY ./.babelrc /app/.babelrc
COPY ./src /app/src
WORKDIR /app
RUN npm install
EXPOSE 3005
VOLUME [ "/var/run/docker.sock" ]
CMD ["npm", "run", "serve"]