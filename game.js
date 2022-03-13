function randn(max) {
	return Math.floor(Math.random() * max + 1);
}

function randmove() {
	game.move(randn(5));
}


function good() {
	console.log('g');
	game.move(6 - game.last)
		.push(good);
}

function bad() {
	console.log('b');
	
	if (game.last === 6 - game.last2) {
		game.push(randmove)
			.push(bad);
	} else {
		if (game.last < 6 - game.last2)
			game.push(function() { game.move(6 - game.last - game.last2); });
		else
			game.push(function() { game.move(12 - game.last - game.last2); });				
		game.push(good);
	}
	
	game.respond();
}


function badmod1() {
	console.log('bm1');
	
	if (game.number.length === game.zero + 1) {
		if (game.number[game.zero] > 3) {
			game.push(function() {
					game.move(9 - game.number[game.zero]); 
				})
				.push(good);
		} else if (game.number[game.zero] < 3) {
			game.push(function() { 
					game.move( 3 - game.number[game.zero]); 
				})
				.push(function() { 
					game.move(6 - game.last);
					game.zero = game.number.length; 
				})
				.push(function() {
					badmod2();
				});
		} else { // if (game.number[game.zero] === 3)
			game.push(randmove)
				.push(badmod1);
		}
	} else { // if (game.number.length !== game.zero + 1)
		if (game.last === 6 - game.last2) {
			game.push(function() { game.move(randn(5)); })
				.push(badmod1);
		} else if (game.last > 6 - game.last2) {
			if (game.last + game.last2 === 10) {
				game.push(function() { 
						game.move(2); 			
						game.zero = game.number.length;
					})
					.push(good);
			} else { // if (game.last + game.last2 !== 10)
				game.push(function() { game.move(12 - game.last - game.last2); })
					.push(good);
			}
		} else { // if (game.last < 6 - game.last2)
			game.push(function() { 
					game.move(6 - game.last - game.last2); 
					game.zero = game.number.length;
				})
				.push(function() {
					badmod2();
				});
		}
	}
	
	game.respond();
}

function badmod2() {
	console.log('bm2');
		
	if (game.number.length === game.zero + 1) {
		if (game.number[game.zero] > 3) {
			game.push(function() { 
					game.move(9 - game.number[game.zero]);			
					game.zero = game.number.length;
				})
				.push(badmod1);
		} else if (game.number[game.zero] < 3) {
			game.push(function() { game.move( 3 - game.number[game.zero]); })
				.push(function() { game.move(6 - game.last); })
				.push(good);
		} else { // if (game.number[game.zero] === 3)
			game.push(function() { game.move(randn(5)); })
				.push(badmod2);
		}
	} else { // if (game.number.length !== game.zero + 1)
		if (game.last === 6 - game.last2) {
			game.push(function() { 
					game.move(randn(5));
				})
				.push(badmod2);
		} else if (game.last > 6 - game.last2) {
			if (game.last + game.last2 === 10) {
				game.push(function() { game.move(5); })
					.push(badmod2);
			} else {
				var temp = (game.number.length - 1) % 8;
				if (temp === 2) {
					game.push(function() { game.move(6 - game.last); })
						.push(function() { game.move(6 - game.last); });
				} else if (temp === 4) {
					game.push(function() { game.move(6 - game.last); });						
				}
				game.push(function() {
					game.zero = game.number.length - 1;
					badmod1();
				});
			}
		} else { // if (game.last < 6 - game.last2)
			game.push(function() {
					game.move(6 - game.last - game.last2);
					game.zero = game.number.length;
				})
				.push(function() {
					badmod1();
				});
		}
	}
	
	game.respond();
}


var game = {
	stats: {
		computer: 0,
		human: 0
	},
	dom: {
	},
	number: [],
	queue: [],
	players: [],
	playersUC: {
		'computer': ' компьютер',
		'human': 'игрок'
	},
	len: 0,
	isOver: false,
	hasTerminated: false,
	automove: false,
	
	init: function(digOut, resOut) {
		this.dom.digits = digOut;
		this.dom.result = resOut;
		return this;
	},
	
	start: function(n, first, test) {
		this.dom.digits.innerHTML = '';
		this.dom.result.innerHTML = '';
		this.number.length = 0;
		this.queue.length = 0;
		this.hasTerminated = false;
		this.isOver = false;
		this.zero = 0;
		
		this.len = 2 * n;
		this.first = first;
		this.automove = test || false;
		
		for (var i = 0; i < this.len; i++) {
			var countdown = document.createElement('span');
			countdown.appendChild(document.createTextNode('.'));
			this.dom.digits.appendChild(countdown);
		}
		
		this.players[first] = 'computer';
		this.players[(first + 1) % 2] = 'human';
		
		var mod = n % 3;

		if (mod === 0) {
			if (first === 1)
				this.push(good);
			else // if (first === 0)
				this.push(randmove)
					.push(bad);
		} else if (first === 0) {
			this.push(function() { game.move(3); })
				.push(good);
		} else { // if (first === 1 && mod !== 0)
			if (mod === 1)
				this.push(badmod1)
			else 
				this.push(badmod2);
		}
		
		if (this.first === 0) {
			this.respond();
		} else if (this.automove) {
			game.move(randn(5), true);
			window.setTimeout(this.respond.bind(this), 0);		
		}
	},
	
	end: function() {
		if (!this.hasTerminated) {
			var check = Number(this.number.reduce(function(pv, cv) {
					return pv + cv;
				}, 0) % 9 === 0),
				who = this.players[check];
			this.stats[who] += 1;
			this.queue.length = 0;
			this.dom.result.innerHTML = (check ? '': ' не') + ' делится на 9. Выиграл ' + this.playersUC[who] + '.';
			this.hasTerminated = true;
		}
		
		return this;
	},
	
	push: function(response) {
		this.queue.push(response);
		return this;
	},
	
	respond: function() {
		if (!this.isOver) {
			var f = this.queue.shift();
			if (f) f();
			if (this.automove) {
				game.move(randn(5), true);
				this.respond(); // beware of recursion
			}
		} else {
			this.end();
		}
		
		return this;
	},

	move: function(digit, human) {
		if (!this.isOver) {
			this.number.push(digit);
			this.last2 = this.last;
			this.last = digit;
			var div = this.dom.digits.children[this.number.length - 1];
			div.innerHTML = digit;
			if (human)
				div.className = 'playerMove';
			if (this.number.length >= this.len)
				this.isOver = true;
		}
		if (this.isOver)
			this.end();
		return this;
	}
};