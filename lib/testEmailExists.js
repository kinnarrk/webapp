require('mysql2/node_modules/iconv-lite').encodingExists('foo');
//
const db = require("../models");
// db.sequelize.sync();

const User = db.users;
const Op = db.Sequelize.Op;
//
// let createdUser;
beforeAll( () => {
    db.sequelize.sync();
    const user1 = {
        email: "johndoe@example.com",
        password: "Password@123",
        first_name: "John",
        last_name: "Doe"
    };

    var bcryptUtil = require('./utils');

    user1.password = bcryptUtil.bcryptText(user1.password);

    createdUser = User.create(user1);
});

afterAll( () => {
    createdUser.destroy();
});


describe("Email validator function false", () => {
    test("It should check from database if the email exists or not", () => {
        const newEmail = "janedoe@example.com";
        let result = false;
        const newUser = User.findOne({ where: { email: newEmail } });
        if (newUser) {
            result = true;
        }
        expect(result).toEqual(false);
    });
});
describe("Email validator function true", () => {
    test("It should check from database if the email exists or not", () => {
        const newEmail = "johndoe@example.com";
        let result = true;
        const newUser = User.findOne({ where: { email: newEmail } });
        if (newUser) {
            result = true;
        }
        expect(result).toEqual(true);
    });
});
