import mysql from 'mysql2/promise';

let connection: mysql.Connection;

async function connect() {
    if (!connection) {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'test'
        });
    }
    return connection;
}

export default {
    connect
};
