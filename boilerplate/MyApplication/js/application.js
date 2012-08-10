/*
* Name: @@@application-name@@@
* Description: Main Application Object	
*
*
*/

/*		Application Model		*/


/*		Application Object		*/
Class('Application::Controller', {

	view: new View(),
	model: new Model(),

	/* Dom is active */
	didBecomeActive: function() {
		Viewport().addViews('$$', this.view);
	}

});