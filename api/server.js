const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session')
const bcrypt = require('bcryptjs');

const Users = require('../users/users-model.js');
const restricted = require('./restricted-middleware');
const server = express();

const sessionConfig = {
  name: 'honolulu',
  secret: process.send.SESSION_SECRET || 'I swear I am up to no good',
  cookie: {
    maxAge: 1000 * 60,
    secure: false,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: false,
}
server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(session(sessionConfig));


server.get('/', (req, res) => {
  res.send("Webauth-i-challenge & Webauth-ii-challenge");
});

server.post('/api/register', (req, res) => {
  let user = req.body;
console.log(user)
  const hash = bcrypt.hashSync(user.password, 12);

  user.password = hash

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
}); 

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;
      console.log({username, password})
  Users.findBy({username})
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
}); 

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
}); 

server.get('/hash', (req, res) => {
  const name = req.query.name;
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync("B4c0/\/", salt)
  res.send(`the hash for ${name} is ${hash}`);
});

module.exports = server;