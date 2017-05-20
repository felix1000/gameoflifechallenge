FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/game-of-life-changelle
WORKDIR /usr/src/game-of-life-changelle

# Install app dependencies
COPY package.json /usr/src/game-of-life-changelle
RUN npm install

# Bundle app source
COPY . /usr/src/game-of-life-changelle

EXPOSE 3000
EXPOSE 4000
CMD [ "npm", "start" ]
