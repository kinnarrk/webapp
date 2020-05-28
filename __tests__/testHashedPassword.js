var bcryptUtil = require('../lib/utils');
describe("Bcrypt check function", () => {
    test("it should compare plain password text to hashed password", () => {
        const plainText = "Abcd@1234";
        const hashedPassword = "$2a$10$6eTBYgjRmZq21do0yAuIcuT0wC87W6aoA1l5DvfzkGXQCaoNK2MOq";

        expect(bcryptUtil.bcryptCompare(plainText, hashedPassword)).toEqual(true);
    });
});
describe("Bcrypt check function 2", () => {
    test("it should compare plain password text to different hashed password", () => {
        const plainText = "Abcd@1234";
        const otherHashedPassword = "$2a$10$uVWkku8CNZLj/LFtr7wwTuLGw.z18DYs1mQO.Z0cXxSliB4OJNoQe";

        expect(bcryptUtil.bcryptCompare(plainText, otherHashedPassword)).toEqual(false);
    });
});
