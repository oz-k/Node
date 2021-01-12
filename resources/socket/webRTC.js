const model = require('../../models');
const Sequelize = require('sequelize');
const fs = require('fs');

module.exports = function(namespace) {
    namespace.on('connection', function(socket) {
        console.log('connect', socket);
    });
}