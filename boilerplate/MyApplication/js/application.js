/*
* Name: @@@application-name@@@
* Description: Main Application Object	
*
*
*/

/*		Application Model		*/


/*		Application Object		*/
Class('ApplicationController', {

	view: new View(),

	/* Dom is active */
	didBecomeActive: function() {
		Viewport().addViews('$$', this.view);
	}

});