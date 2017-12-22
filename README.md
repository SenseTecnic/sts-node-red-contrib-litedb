sts-node-red-node-litedb
========================

This is a simple Node-Red node to read and write a single local sqlite database.

This is based on the SQLite node - node-red-node-sqlite.

Install
-------

Run the following command in the root directory of your Node-RED install

    npm install SenseTecnic/sts-node-red-contrib-litedb --build-from-source

The `--build-from-source' option will ensure the SQLite file size is limited and PRAGMA sql statements
are disabled in SQLite.

Usage
-----

Allows basic access to a single Sqlite database file.

This node uses the <b>db.all</b> operation against the configured database. This does allow INSERTS, UPDATES and DELETES.

Note that PRAGMA statements are NOT permitted; an error will be reported.

By it's very nature it is SQL injection... so *be careful* out there...

**msg.topic** must hold the <i>query</i> for the database, and the result is returned in **msg.payload**.

Typically the returned payload will be an array of the result rows, (or an error).

The reconnect timeout in milliseconds can be changed by adding a line to **settings.js**

    litedbReconnectTime: 20000,

The file to use for the single database (relative to the user directory) can be set by adding the following line to **settings.js**

    litedbFileName: "litedb"

