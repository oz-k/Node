const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports.hashing = function(string) {
    //promise
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(string, salt, function(err, hash) {
                resolve(hash);
            });
        });
    });
}
module.exports.comp = function(string, hash) {
    //promise
    return new Promise(function(resolve, reject) {
        bcrypt.compare(string, hash, function(err, result) {
            resolve(result);
        })
    })
    
}