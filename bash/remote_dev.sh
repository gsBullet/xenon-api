#!/bin/bash
unzip -o LmsRetina
cd LmsRetina

/home/ubuntu/.nvm/versions/node/v12.18.3/bin/pm2 stop lmsstage
/usr/bin/npm run deploy
/home/ubuntu/.nvm/versions/node/v12.18.3/bin/pm2 logs