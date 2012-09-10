var mysql = require('mysql');

var cache = {};

var wpsql = {
    connect: function(host, user, password, db, prefix) {
        this.prefix = prefix;

        var connection = mysql.createConnection({
            host     : host,
            user     : user,
            password : password,
            database : db
        });

        connection.connect();

        this._handleDisconnect(connection);

        return this.connection = connection;
    },
    getPosts: function(params, callback) {
        if (arguments.length == 1) {
            callback = params;
            params = null;
        }

        serializeParams = JSON.stringify(params);
        if (cache.getPosts && cache.getPosts[serializeParams]) {
            callback && callback(cache.getPosts[serializeParams]);
            return;
        }

        this.connection.query('SELECT * FROM ' + this.prefix + 'posts', function(err, rows, fields) {
            if (err) throw err;

            console.log('read from DB');
            cache.getPosts = cache.getPosts || {};
            cache.getPosts[serializeParams] = rows;
            callback && callback(rows);
        });
    },
    getPostById: function(id, callback) {
        if (arguments.length == 1) {
            callback = params;
            params = null;
        }

        serializeParams = id;
        if (cache.getPostById && cache.getPostById[serializeParams]) {
            callback && callback(cache.getPostById[serializeParams]);
            return;
        }

        this.connection.query('SELECT * FROM ' + this.prefix + 'posts WHERE ID = "' + id + '"', function(err, rows, fields) {
            if (err) throw err;

            cache.getPostById = cache.getPostById || {};
            cache.getPostById[serializeParams] = rows;
            callback && callback(rows);
        });
    },
    closeConnection: function() {
        this.connection.end(function(err) {
            if (err) throw err;
        });
    },
    _handleDisconnect: function(connection) {
        var _this = this;

        connection.on('error', function(err) {
            if (!err.fatal) {
                return;
            }

            if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
                throw err;
            }

            console.log('Re-connecting lost connection: ' + err.stack);

            connection = mysql.createConnection(connection.config);
            _this._handleDisconnect(connection);
            connection.connect();
        });
    }
};

exports = module.exports = wpsql;