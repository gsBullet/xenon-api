#!/bin/bash
unzip -o LmsRetina
cd LmsRetina

/home/ubuntu/.nvm/versions/node/v18.16.0/bin/pm2 stop all
/usr/bin/npm run deploy
/home/ubuntu/.nvm/versions/node/v18.16.0/bin/pm2 logs