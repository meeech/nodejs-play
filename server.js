var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('../node-libs/socket.io-node'),
		sys = require('sys'),
		
server = http.createServer(function(req, res){
	// your normal server code
	var path = url.parse(req.url).pathname;
	switch (path){
		case '/':
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
			res.end();
			break;
			
		case '/json.js':
		case '/chat.html':
		case '/client.html':
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
                res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'});
				res.write(data, 'utf8');
				res.end();
			});
			break;
			
		default: send404(res);
	}
}),

send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
};

server.listen(8080);
		
// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server),
		buffer = [];

var games = {
        a : {
            player1: false,
            player2: false
        }
    };

//Join a player to a game.
//Right now, only have one game: a, so if player 1 spot is taken, 
//we pop em into player2
var joinPlayer = function(client) {
    
    var playerId = 2;

    if( false == games.a.player1) {
        playerId = 1
    } 

    games.a['player'+playerId] = client;
    client.send({
        "msg": "You are player"+playerId,
        "playerId": playerId
    });
};
		
io.on('connection', function(client){
    
    joinPlayer(client);
    
    // client.send({ buffer: buffer });
    // client.broadcast({ announcement: client.sessionId + ' connected' });

	client.on('message', function(message){
		var msg = { message: [client.sessionId, message] };
		buffer.push(msg);
		if (buffer.length > 15) buffer.shift();
		client.broadcast(msg);
	});

	client.on('disconnect', function(){
		client.broadcast({ announcement: client.sessionId + ' disconnected' });
	});
});