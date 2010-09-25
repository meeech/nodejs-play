var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('../node-libs/socket.io-node'),
		sys = require('sys'),
		geo = require('./lib/geo/lib/geoUtils.js'),
		
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

//Track all players / sessionId
var players = {};

//Join a player to a game.
//Right now, only have one game: a, so if player 1 spot is taken, 
//we pop em into player2
var joinPlayer = function(client) {
    
    var playerId = 2;

    if( false == games.a.player1) {
        playerId = 1;
    }

    games.a['player'+playerId] = client;

    //Link sessionId for easy lookup
    players[client.sessionId] = games.a["player"+playerId];
    client.send({
        "msg": "You are player"+playerId,
        "playerId": playerId
    });
    
    //We can infer both positions are filled, so start game
    if(2 == playerId) {
        gameBegin();
    }
};

var gameBegin = function() {
    setInterval(function() {
        //very functional
        var player1 = games.a.player1,
            player2 = games.a.player2;

        if(player1.currentPosition && player2.currentPosition) {
            console.log("calculate distance");
        } else {
            console.log('missing coords');
        }

    }, 2000);

};
		
io.on('connection', function(client){
    
    joinPlayer(client);
    
    // client.send({ buffer: buffer });
    // client.broadcast({ announcement: client.sessionId + ' connected' });

	client.on('message', function(message){

        var msg = JSON.parse(message);
        console.log(message);
        if(msg.coords) {
            sys.puts(client.sessionId);
            players[client.sessionId].currentPosition = msg.coords;
        };
	});



	client.on('disconnect', function(){
		client.broadcast({ announcement: client.sessionId + ' disconnected' });
	});
});