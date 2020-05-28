const bcrypt = require('bcryptjs');

exports.bcryptText = function(text) {
    return bcrypt.hashSync(text, 10);
}

exports.bcryptTextAsync = function(text) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(text, salt, (err, hash) => {
            if (err) throw err;
            console.info("bcrypt hash: " + hash);
            return hash;
        });
    });
}

exports.bcryptCompare = function(text, hash) {
    return bcrypt.compareSync(text, hash);
}
