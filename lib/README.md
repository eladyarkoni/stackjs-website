StackJS Framework Version 0.4
Author: Elad Yarkoni

CHANGELOG

Version 0.4
-------------
   - add: didHashChanged for url hash change events
- add: default object setInterval and setTimeout methods implementation with object context
- add: removeEvent method on view objects
- add: link html elements to view members through outlet attribute
- add: getView method to get single html element
- fix: getViews now gets all matched elements
- fix: Viewport element setter on load event (window.attachEvent browsers)	

Version 0.3
-------------
- add: local classses support (use LocalClass instead of Class)
- fix: handle undefined parameters in addViews method
- fix: handle undefined body element

Version 0.2
-------------
- add: nodejs integration!
- change: View: addEvent method signature. use addEvent(string selector, string eventType, string eventName, boolean preventDefault);
- fix: print stack trace only if there is no 'Catch' for the exception

Version 0.1.2
-------------
- fix: add event to root element when addEvent selector returns nothing
- add: DeprecatedException exception is added. use Throw(new DeprecatedException(<old method>, <new method>));
- add: new view property: elementType. (default is "div")
- add: new view property: elementClass. (default is "view")
- add: Viewport new methods: getWidth() and getHeight()
- change: didBecomeActive method gets the Viewport view object as parameter

Version 0.1.1
-------------
- fix: add event for multiple elements
- fix: loosing element context while adding multiple view with addViews method
- fix: viewport didBecomeActive event