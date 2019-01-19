const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./database/dbConfig.js');

const server = express();

server.use(express.json());
server.use(cors());

server.post('/api/register', (req, res) => {
  const creds = req.body;

  const hashedPassword = bcrypt.hashSync(creds.password, 14);

  creds.password = hashedPassword;

  db('users')
    .insert(creds)
    .then(ids => {
      res.status(201).json(ids);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

server.post('/api/login', (req, res) => {
  const creds = req.body;

  db('users')
    .where({ username: creds.username }).first()
    .then(user => {
      if(user && bcrypt.compareSync(creds.password, user.password)) {
        // password match and user exists by that username
        res.status(200).json({message: 'welcome!'});
      } else {
        // either username is invalid or password is wrong
        res.status(401).json({message: 'you shall not pass!!'});
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });  
});


// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  db('users')
    .select('id', 'username', 'password')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.listen(3300, () => console.log('\nrunning on port 3300\n'));
