/*
* Name: Cards War Game
* Description: Main Application Object
*
*/

/*
*	Card class model
*/
Class("Card", {

	shape: null,
	value: null,
	className: null,

	Card: function(shape, value) {
		this.shape = shape;
		this.value = value;
		this.className = "card-" + value + shape.toLowerCase().charAt(0);
	},

	equals: function(card) {
		return (card.getValue() === this.getValue());
	},

	wins: function(card) {
		return (this.getValue() > card.getValue());
	}
});

/*
*	Deck of cards class model
*/
Class("Deck", {

	cards: null,

	Deck: function() {
		this.cards = [];
	},

	fetchCard: function() {
		return this.cards.pop();
	},

	/*
	* Fetch random class from deck
	*/
	fetchRandomCard: function() {
		var randomIndex = Math.floor(Math.random() * this.cards.length);
		var randomCard = this.cards[randomIndex];
		this.cards.splice(randomIndex, 1);
		return randomCard;
	},

	/*
	* Add new card to deck
	*/
	addCard: function(card) {
		this.cards.push(card);
	},

	isEmpty: function() {
		return (this.cards.length === 0);
	},

	/*
	* Win a card - push card to the deck bottom
	*/
	winCard: function(card) {
		this.cards.reverse();
		this.cards.push(card);
		this.cards.reverse();
	}
});

/*
*	Player class model
*/
Class("Player", {

	name: null,
	human: null,
	deck: null,
	droppedCard: null,

	Player: function(name, human, deck) {
		this.name = name;
		this.human = human;
		this.deck = deck;
	},

	/*
	* Play - fetch card to drop zone
	*/
	play: function() {
		this.droppedCard = this.deck.fetchCard();
	}
});

/*
*	Game class model
*/
Class("Game", {
	player1: null,
	player2: null,
	winner: null
});

/*
*	Game Factory
*/
Class("GameFactory", {

	/*
	* Create Deck of cards (sorted)
	*/
	createDeck: function() {
		var deck = new Deck();
		for (var i = 1; i <= 13; i++) {
			deck.addCard(new Card("DIAMONDS", i));
			deck.addCard(new Card("CLUBS", i));
			deck.addCard(new Card("SPADES", i));
			deck.addCard(new Card("HEARTS", i));
		}
		return deck;
	},

	/*
	* Create new game
	*/
	createGame: function() {
		var newGame = new Game();
		var cards1 = new Deck();
		var cards2 = new Deck();
		var deck = this.createDeck();
		// divide deck between two players
		var index = 0;
		while (!deck.isEmpty()) {
			var card = deck.fetchRandomCard();
			if ((index % 2) === 0) {
				cards1.addCard(card);
			} else {
				cards2.addCard(card);
			}
			index++;
		}
		newGame.setPlayer1(new Player("Human", true, cards1));
		newGame.setPlayer2(new Player("Computer", true, cards2));
		return newGame;
	}
});

/*
*	Player view
*/
Class('PlayerView::View', {

	PlayerView: function(player) {
		this.setModel(player);
	},

	/*
	* Get the dropped card css class name
	*/
	getDroppedCardClass: function() {
		var droppedCard = this.getModel().getDroppedCard();
		if (droppedCard === null) {
			return "";
		} else {
			return droppedCard.getClassName();
		}
	},

	render: function() {
		this.clearViews();
		this.addClasses("player-view");
		this.addViews("<div class='name'>$$ ($$)</div>", this.getModel().getName(), this.getModel().getDeck().getCards().length);
		this.addViews("<div class='row'><div class='cards span3'></div><div class='drop-zone span3 $$'></div></div>",
		this.getDroppedCardClass());
	}
});

/*
*	Game view
*/
Class('GameView::View', {

	enableAttackButton: null,

	GameView: function() {
		this.enableAttackButton = false;
	},

	/*
	* Render the game view on each turn
	*/
	render: function() {
		this.enableAttackButton = false;
		this.clearViews();
		this.addClasses("game-view container");

		if (this.getModel().getWinner() !== null) {
			this.addViews("<div class='winner-message'>The winner is $$</div>", this.getModel().getWinner().getName());
			return;
		} else {
			this.addViews("<div class='row'>$$</div><div class='row'>$$</div><div class='btn btn-large btn-primary disabled'>Attack</div>",
				new PlayerView(this.getModel().getPlayer2()),
				new PlayerView(this.getModel().getPlayer1()));
			this.addEvent(".btn", "onclick", "attackEvent");
		}
		var self = this;
		setTimeout(function(){
			self.getViews(".btn").className += "btn btn-large btn-primary";
			self.enableAttackButton = true;
		},1000);
	},

	/*
	* handle attack button click event
	*/
	handleEvents: function(evt, evtName) {
		if (this.enableAttackButton) {
			this.callDelegate("attack");
		}
	}
});

/*
*	Game controller
*/
Class('GameController', {

	view: null,
	model: null,

	/*
	* Game controller C'tor - create a new game and initialize view and model objects
	*/
	GameController: function() {
		this.view = new GameView();
		this.model = GameFactory().createGame();
		this.view.setDelegate(this);
		this.view.setModel(this.model);
	},

	/*
	* Delegate method: player attack
	*/
	attack: function() {
		var p1 = this.model.getPlayer1();
		var p2 = this.model.getPlayer2();
		p1.play();
		p2.play();

		// check if there's a winner in the game
		if (typeof(p2.getDroppedCard()) === 'undefined') {
			this.model.setWinner(p1);
			this.view.render();
			return;
		} else if (typeof(p1.getDroppedCard()) === 'undefined') {
			this.model.setWinner(p2);
			this.view.render();
			return;
		}

		// check turn winner
		if (p1.getDroppedCard().wins(p2.getDroppedCard())) {
			p1.getDeck().winCard(p2.getDroppedCard());
		} else if (p2.getDroppedCard().wins(p1.getDroppedCard())) {
			p2.getDeck().winCard(p1.getDroppedCard());
		} else {
			p1.getDeck().winCard(p1.getDroppedCard());
			p2.getDeck().winCard(p2.getDroppedCard());
		}
		// render the game view
		this.view.render();
	}
});

/*
*	Application controller
*/
Class('Application', {
	/* Dom is active */
	didBecomeActive: function() {
		var gameController = new GameController();
		Viewport().addViews('$$', gameController.getView());
	}
});