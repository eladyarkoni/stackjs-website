/*
* Name: @@@application-name@@@
* Description: Main Application Object	
*
*
*/

/*		Application Model		*/
Class('Movie', {

	name: null,
	description: null,
	image: null,
	empty: true,

	fromJson: function(jsonObject) {
		this.name = jsonObject.Title;
		this.description = jsonObject.Plot;
		this.image = jsonObject.Poster;
		this.empty = false;
	}
});

/*		Application Views		*/
Class('SearchBar::View', {

	searchString: "",

	render: function() {
		this.addClasses("search-bar");
		this.addViews("<input type='text' placeholder='Enter movie name...'></input>");
		this.addViews("<button>Search</button>");
		this.addEvent("button", "onclick", "clickSearchButtonEvent");
		this.addEvent("input", "onchange", "movieSearchChangeEvent");
	},

	handleEvents: function(evt, eventName) {
		switch (eventName) {
			case 'clickSearchButtonEvent':
				this.callDelegate("doSearchMovie", [this.searchString]);
			break;
			case 'movieSearchChangeEvent':
				this.searchString = evt.target.value;
			break;
		}
	}
});

Class('ResultView::View', {

	render: function() {
		this.clearViews();
		this.addClasses('result-view');
		if (! this.model.getEmpty()) {
			this.addViews("<div class='movie-name'>$$</div>", this.model.getName());
			this.addViews("<div class='movie-description'>$$</div>", this.model.getDescription());
			this.addViews("<div class='movie-image' style='background-image: url($$);' ></div>", this.model.getImage());
		}
	}
});

Class('MainPage::View', {

	resultView: null,

	render: function() {
		this.addClasses("main-page");
		this.addViews("$$", new SearchBar());
		this.resultView = new ResultView();
		this.addViews("$$", this.resultView);
	},

	updateView: function() {
		this.resultView.render();
	}
});

/*		Application Object		*/
Class('Application', {

	view: new MainPage(),
	model: new Movie(),

	/* Dom is active */
	didBecomeActive: function() {
		this.view.setDelegate(this);
		this.view.setModel(this.model);
		Viewport().addViews('$$', this.view);
	},

	doSearchMovie: function(movieName) {
		var self = this;
		$.ajax({
			url: 'http://www.imdbapi.com/?t=' + movieName,
			dataType: 'jsonp',
			success: function(movieJsonObject) {
				self.model.fromJson(movieJsonObject);
				self.view.updateView();
			}
		});
	}
});