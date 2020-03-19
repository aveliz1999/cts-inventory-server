# cts-inventory-server

RESTful back-end for the cts-inventory project. Used to keep track of and update computer/projector/etc. inventory.

## Install Instructions

* `git clone https://github.com/aveliz1999/cts-inventory-server`
* `cd cts-inventory-server`
* `npm install`
* Rename or copy all the .json.example files in config/ to just *.json
* Change the config files to match your environment
* In order to initialize the admin user during initial installation, run `sequelize-cli db:seed:all`. This will initialize it with username `administrator` and password `password`

## Usage

To start the server just run `npm start`, or `ts-node bin/www.ts` if not running in an environment that can use npm scripts.
The server will run on port 3000 be default, but this can be changed by setting the environment variable `PORT`.
