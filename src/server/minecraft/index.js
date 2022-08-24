

const { newGameServer } = require('..');
const config = require('./config.json');


const minecraft = newGameServer(config)

module.exports = minecraft