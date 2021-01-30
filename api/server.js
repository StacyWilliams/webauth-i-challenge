const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Users = require('../users/users-model.js');

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());


server.get('/', (req, res) => {
  res.send("Webauth-i-challenge!");
});//endpoint works

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
}); //endpoint works

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;
      console.log({username, password})
  Users.findBy({username})
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
}); //endpoint works

server.get('/api/users', (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
}); //endpoint works

server.get('/hash', (req, res) => {
  const name = req.query.name;
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync("B4c0/\/", salt)
  res.send(`the hash for ${name} is ${hash}`);
});

module.exports = server;