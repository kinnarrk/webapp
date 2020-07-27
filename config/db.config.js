module.exports = {

    "development": {
        HOST: "localhost",
        USER: "root",
        PASSWORD: "root",
        DB: "bookstore",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    "test": {
        HOST: process.env.DBHost || "localhost",
        USER: process.env.DBUser || "root",
        PASSWORD: process.env.DBPassword || "root",
        DB: process.env.DBName || "bookstore",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    "production": {
        HOST: process.env.DBHost || "localhost",
        USER: process.env.DBUser || "root",
        PASSWORD: process.env.DBPassword || "root",
        DB: process.env.DBName || "bookstore",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        // ssl: 'Amazon RDS',
        dialectOptions: {
            ssl: 'Amazon RDS',
            rejectUnauthorized: true
        }
    }
};
