/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Portions Copyright (c) 2016 Sense Tecnic Systems, Inc.
 **/

module.exports = function(RED) {
    "use strict";
    var sqliteReconnectTime = RED.settings.litedbReconnectTime || 20000;
    var liteDbFileName = RED.settings.litedbFileName || "litedb";
    var sqlite3 = require('sqlite3');

    var sqlitedb = null;
    var connections = 0;
    var connectionTimer = null;

    // connect to sqlitedb if required
    function dbConnect(node) {
        if (sqlitedb === null) {
            sqlitedb = new sqlite3.Database(RED.settings.userDir+"/"+liteDbFileName);
            sqlitedb.on('open', function() {
                node.log("opened litedb database ok");
            });
            sqlitedb.on('error', function(err) {
                node.error("failed to open litedb database", err);
                node.tick = setTimeout(function() { dbConnect(node); }, sqliteReconnectTime);
            });           
        }
        // assume we will eventually connect
        connections ++;
    }

    // close if needed
    function dbClose(node) {
        connections --;
        if ((connections === 0) && sqlitedb) {
            node.log("closing litedb database ok");
            sqlitedb.close();
            sqlitedb = null;
            if (connectionTimer) {
                clearTimeout(connectionTimer);
            }
        }
    }

    function SqliteNodeIn(n) {
        RED.nodes.createNode(this,n);
        var node = this;

        dbConnect(node);

        node.on("input", function(msg) {
            if (typeof msg.topic === 'string') {
                var bind = Array.isArray(msg.payload) ? msg.payload : [];
                sqlitedb.all(msg.topic, bind, function(err, row) {
                    if (err) { node.error(err,msg); }
                    else {
                        msg.payload = row;
                        node.send(msg);
                    }
                });
            }
            else {
                if (typeof msg.topic !== 'string') {
                    node.error("msg.topic : the query is not a string",msg);
                }
            }
        });
        node.on("close", function() {
            dbClose(node);
        })
    }
    RED.nodes.registerType("litedb",SqliteNodeIn);
}
