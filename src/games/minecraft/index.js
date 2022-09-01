

const { newGameServer } = require('../../server');
const config = require('./config.json');


const minecraft = newGameServer({config})

module.exports = minecraft