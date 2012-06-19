/*
* Name: @@@application-name@@@
* Description: Main Application Object	
*
*
*/

Class('Application', {

	applicationName : '@@@application-name@@@',
	applicationLabel: '@@@application-label@@@',
	storyBoard: new StoryBoard(),

	getInstance: function() {
		return this._sharedInstance;	
	},

	/* Dom is active */
	didBecomeActive: function() {
		console.log('Application is active');
		this.storyBoard.load();
	}

});