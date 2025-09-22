# RetinaLMS

API Documentation: [https://retinalms.surge.sh](https://retinalms.surge.sh/)

### Prerequisites:

+ NodeJS
+ NPM
+ MongoDB >= 4.x (with replica set)
+ Redis
### Installation steps:

#### Step 01: install databases
+ First off all install MongoDB version >= 4.x
+ Then, install redis

#### Step 02: Run the project
+ npm install
+ cp example.env dev.env
+ fill the dev.env file in with proper credentials
+ npm run dev
+ npm run worker

#### Worker
+ To add multiple worker, add worker script in apps array in ecosystem.config.js file.# xenon-api
