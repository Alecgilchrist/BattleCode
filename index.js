const express = require('express');

require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./dbTools');
const auth = require('./auth');

const app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
app.set('port', port);
const server = app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('listening on port', port);
  }
});
// let users = 0;
// const io = require('socket.io')(server);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('connected');
  socket.on('room', (data) => {
    console.log('in joining room in SERVER', data);
    const room = data.testName;
    socket.join(room);
    socket.to(room).emit('new user join', [data.user]);
    // setTimeout(() => {
    //   socket.in('alpha').emit('new user join', data.user)
    // }, 2000);
    socket.on('msg', (msgData) => {
      console.log(msgData, 'this is the emit from a win');
      socket.to(room).emit('winner', msgData);
      // socket.disconnect();
    });
  });
  socket.on('SEND_MESSAGE', (chat) => {
    io.emit('RECEIVE_MESSAGE', chat);
  });
  // socket.on('msg', (msgData) => {
  //   console.log(msgData, 'this is the emit from a win');
  //   socket.to(data.testName).emit(msgData)
  //   socket.disconnect('room');
  // });
});

app.post('/signin', (req, res) => {
  auth.tokenCheck(req.body.idtoken, (gUserData) => {
    db.findUser(gUserData, (bcUserProfile) => {
      res.status(200).send(bcUserProfile);
    });
  });
});
app.get('/competitions', db.getChallenges);
app.get('/competition', db.getChallengeById);
app.post('/uniquecompetition', db.returnOneChallenge);
app.post('/makechallenge', db.makeChallenge);
app.post('/gamewin', db.gameWin);
app.get('/games', db.getGameWinners);
app.get('/findUserById', db.findUserById);
app.post('/solutions', db.addSolution);
app.get('/solutions', db.getSolutions);
app.post('/userprofiles', db.addUserProfile);
app.get('/userprofiles', db.getUserProfile);
