var wpsql = require('./wpsql.js');

wpsql.connect('dev.tadatuta.com', 'wp_tdtt', '12345', 'wp_tdtt', 'wp_');

wpsql.getPosts(console.log);
wpsql.getPostById(2, console.log);

wpsql.closeConnection();