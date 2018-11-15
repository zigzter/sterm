# Sterm

A multiplayer game app built with Express.

Current features:

* Tic Tac Toe
* Connect 4
* Global and game chat
* Private messaging via `/msg username message`

Future games:

* Battleship

# Installation

1. Clone repo

2. Install dependencies
```
npm install
```

3. Migrate DB
```
knex migrate:latest
```

4. Run server  
```
npm run dev
```
5. Navigate to http://localhost:3000

# Tech used

* Node.js
* Express
* Socket.io
* jQuery
* Bootstrap
* bcrypt

# Working Heroku example

## [Heroku App](https://sterm.herokuapp.com)