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

exports.getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}