FROM node:13

# install postgres client
RUN apt-get update \
    && apt-get install -y postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY ./entrypoints /usr/local/bin/
RUN chmod -R 755 /usr/local/bin/

# install app dependencies
# a wildcard is used to ensure both package.json AND package-lock.json
# are copied where available (npm@5+)
COPY package*.json ./

RUN npm config set puppeteer_skip_chromium_download true -g
RUN npm install
RUN npm install rimraf -g
RUN npm install typescript -g
# if you are building your code for production
# RUN npm ci --only=production

# bundle app source
COPY . /usr/app/

WORKDIR /usr/app