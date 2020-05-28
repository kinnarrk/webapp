module.exports = {

    "development": {
        HOST: "localhost",
        USER: "root",
        PASSWORD: "root",
        DB: "assignment1",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    "test": {
        HOST: "localhost",
        USER: "root",
        PASSWORD: root,
        DB: "assignment",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    "production": {
        HOST: "localhost",
        USER: "root",
        PASSWORD: "root",
        DB: "assignment1",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
};
