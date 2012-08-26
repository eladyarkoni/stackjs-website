/**
*
*	StackJS Framework Version 0.1.2
*	Author: Elad Yarkoni
*
*	CHANGELOG:
*
*	Version 0.1.2
*	-------------
*	- fix: add event to root element when addEvent selector returns nothing
*	- add: DeprecatedException exception is added. use Throw(new DeprecatedException(<old method>, <new method>));
*	- add: new view property: elementType. (default is "div")
*	- add: new view property: elementClass. (default is "view")
*	- add: Viewport new methods: getWidth() and getHeight()
*	- change: didBecomeActive method gets the Viewport view object as parameter
*
*	Version 0.1.1
*	-------------
*	- fix: add event for multiple elements
*	- fix: loosing element context while adding multiple view with addViews method
*	- fix: viewport didBecomeActive event
*
*/
(function(){

	/**
	*
	*	STACKJS Defaults
	*
	**/
	var Defaults = {
		defaultObjectName: "STObject",
		extendsSeperator: "::",
		stackSize: 50,
		viewPlaceholder: '$$'
	};
	
	/**
	*
	*	STACKJS Classes holder
	*
	**/
	var _classes = {};

	/**
	*
	*	STACKJS shared objects holder
	*
	**/
	var _sharedObjects = {};

	/**
	*
	*	STACKJS exception callbacks holder
	*
	**/
	var _exceptionCallbacks = {};

	/**
	*
	*	STACKJS Privates
	*
	**/
	var report = function(text) {
		var date = new Date();
		console.log("STACKJS: " + date.toString() + " : " + text);
	};

	var parseClassName = function(classStr) {
		var classNameArray = classStr.split(Defaults.extendsSeperator);
		var className = classNameArray[0];
		var extend = classNameArray[1];
		return {
			name: className,
			extend: extend
		};
	};

	var callMethodEvent = function(object, property) {
			
	};

	/**
	*
	*	STACKJS Event Manager
	*
	**/
	var EventManager = {

		_observers: {},

		addObserver: function(eventName, delegate, callback) {
			if (typeof(this._observers[eventName]) === 'undefined') {
				this._observers[eventName] = [];
			}
			this._observers[eventName].push({
				delegate: delegate,
				callback: callback
			});
		},

		postEvent: function(eventName, retValue) {
			var observerHandlers = this._observers[eventName];
			if (typeof(observerHandlers) !== 'undefined') {
				for (var i = 0; i < observerHandlers.length; i++) {
					observerHandlers[i].callback.apply(observerHandlers[i].delegate, [retValue]);
				}
			}
		}
	};

	/**
	*
	*	STACKJS Stack Object
	*
	**/
	var Stack = {

		stack: [],
		/**
		* push data to stack
		*/
		push: function(className, methodName) {
			if (Defaults.stackSize == this.stack.length) {
				this.stack.shift();
			}
			this.stack.push({
				className: className,
				methodName: methodName
			});
		},
		/**
		* pop data from stack
		*/
		pop: function() {
			return this.stack.pop();
		},
		/**
		* clear stack
		*/
		clear: function() {
			this.stack = [];
		},
		/**
		* print stack trace
		*/
		printStackTrace: function(exceptionObject) {
			var traceStr = "";
			for (var i = 0; i < this.stack.length; i++) {
				var stackObect = this.stack[i];
				traceStr += stackObect.className + " : " + stackObect.methodName + " -> ";
			}
			traceStr += exceptionObject.toString();
			report(traceStr);
		}
	};

	/**
	* Throw Method
	*
	*/
	var Throw = function(exceptionObject) {
		Stack.printStackTrace(exceptionObject);
		Stack.clear();
		if (typeof(_exceptionCallbacks[exceptionObject._class]) !== 'undefined') {
			_exceptionCallbacks[exceptionObject._class](exceptionObject);	
		} else {
			// throw exceptionObject.toString();	
		}
			
	};

	/**
	* Catch Method
	*
	*/
	var Catch = function(exceptionName, callback) {
		_exceptionCallbacks[exceptionName] = callback;		
	};

	/**
	*
	*	STACKJS Publics
	*
	**/
	var Class = function(name,data) {
		//
		// Get class name and extended class name
		//
		var classNameObject = parseClassName(name);
		name = classNameObject.name;
		var extendsClassName = classNameObject.extend;

		if (typeof(extendsClassName) === 'undefined') {
			extendsClassName = Defaults.defaultObjectName;	
		}

		//
		// get all extended classes 
		//
		var extendedClasses = [];
		var extendsTemp = extendsClassName;
		while (extendsTemp !== Defaults.defaultObjectName) {
			extendedClasses.push(extendsTemp);
			extendsTemp = _classes[extendsTemp].prototype._extends;
		}
		extendedClasses.reverse();

		//
		// Add annotations
		//
		var classPropertiesAnnotations = {};
		for (var property in data) {
			// handle annotations
			if (property.charAt(0) === '@') {
				var matches = property.match(/(\w+)\s*\(\s*(\w+)\s*\)/);
				var propertyName = matches[2];
				var annotationName = matches[1];
				var annotation = {
					annotation: annotationName,
					value: data[property] 
				};
				classPropertiesAnnotations[propertyName] = annotation;
			}
		}

		// 
		// class empty function function
		//
		_classes[name] = function() {

			// identify creation of new object
			if (this.constructor !== _classes[name]) {
				if (typeof(_sharedObjects[name]) === 'undefined') {
					_sharedObjects[name] = new _classes[name]();	
				}
				return _sharedObjects[name];
			}

			if (typeof(extendedClasses) !== 'undefined') {
				for (var i = 0; i < extendedClasses.length; i++) {
					if (typeof(this[extendedClasses[i]]) !== 'undefined') {
						this[extendedClasses[i]].apply(this,arguments);
					}
				}
			}
			
			// active class constructors
			if (typeof(this[name]) !== 'undefined') {
				this[name].apply(this,arguments);	
			}
		};


		//
		// Copy Extended class to new class
		//
		for (var proto in _classes[extendsClassName].prototype) {
			if ((proto.charAt(0) !== "_") && (proto.charAt(0) !== "@")) {
				_classes[name].prototype[proto] = _classes[extendsClassName].prototype[proto];	
			}
		}


		//
		// Modify Class Methods
		//
		for (var propertyName in data) {
			if ((typeof(data[propertyName]) !== 'function')) {
				// create getter
				var getterName = "get" + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
				if ((typeof(data[getterName]) !== 'function') && (propertyName.charAt(0) !== '_') && (propertyName.charAt(0) !== '@')) {
					data[getterName] = (function(originalProperty){
						return function(){
							Stack.push(name, originalProperty);
							var retValue = this[originalProperty];
							Stack.pop();
							callMethodEvent(this, originalProperty);
							return retValue;
						};
					}).apply(data,[propertyName]);
				}
				// create setter
				var setterName = "set" + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
				if ((typeof(data[setterName]) !== 'function') && (propertyName.charAt(0) !== '_') && (propertyName.charAt(0) !== '@')) {
					data[setterName] = (function(originalProperty){
						return function(object){
							Stack.push(name, originalProperty);
							this[originalProperty] = object;
							Stack.pop();
							callMethodEvent(this, originalProperty);
						};
					}).apply(data,[propertyName]);
				}
			} else {
				data[propertyName] = (function(originalProperty){
						var myFunction = this[originalProperty];
						return function(object){
							Stack.push(name, originalProperty);
							var retValue = myFunction.apply(this,arguments);
							Stack.pop();
							callMethodEvent(this, originalProperty);
							return retValue;
						};
				}).apply(data,[propertyName]);
			}
		}

		//
		// convert data object to class
		//
		for (var propertyName in data) {
			_classes[name].prototype[propertyName] = data[propertyName];
		}

		// adding more data instance
		_classes[name].prototype["_extends"] = extendsClassName;
		_classes[name].prototype["_extendsList"] = extendedClasses;
		_classes[name].prototype["_class"] = name;
		_classes[name].prototype["_annotations"] = classPropertiesAnnotations;


		// export to global
		window[name] = _classes[name];
	};

	/********************************************************
	*
	* StackJS Default Object
	*
	*********************************************************/
	Class(Defaults.defaultObjectName, {

		delegate: null,

		isExtends: function(classStr) {
			for (var i = 0; i < this._extendsList.length; i++) {
				if (this._extendsList[i] === classStr) {
					return true;
				}
			}
			return false;
		},

		callDelegate: function(methodName,params) {
			if ((this.delegate !== null) && (typeof(this.delegate[methodName]) !== 'undefined')) {
				this.delegate[methodName].apply(this.delegate, params);
			}	
		},

		clone: function() {
			return Object.create(this);	
		}

	}); 

	/********************************************************
	*
	* StackJS Exception Types
	*
	*********************************************************/
	Class('Exception',{
		message: null,
		Exception: function(message) {
			this.message = message;
		},
		toString: function() {
			return this._class + ": " + this.message + " ";
		}
	});

	Class('MissingAnnotationException::Exception', {
		MissingAnnotationException: function(annotationName) {
			this.message = annotationName + " annotation is missing";
		}	
	});

	Class('InvalidParameterException::Exception', {
		InvalidParameterException: function(expectedType, parameterIndex) {
			this.message = "parameter " + parameterIndex + " should be " + expectedType;
		}
	});

	Class('UnsupportedOperationException::Exception', {
		UnsupportedOperationException: function(methodName) {
			this.message = methodName + " method is not implemented yet";
		}
	});

	Class('DeprecatedException::Exception', {
		DeprecatedException: function(oldMethod, newMethod) {
			this.message = "Method " + oldMethod + " is deprecated, please use " + newMethod + " instead";
		}
	});


	/********************************************************
	*
	* StackJS Client Framework
	*
	*********************************************************/
	Class('View', {
		element: null,
		controller: null,
		model: null,
		elementType: "div",
		elementClass: 'view',

		View: function() {
			this.element = document.createElement(this.elementType);
			this.element.className = this.elementClass;
		},
		addClasses: function() {
			this.element.className = "";
			for (var i = 0; i < arguments.length; i++) {
				this.element.className += arguments[i] + " ";
			}
		},

		getViews: function(selector) {
			return this.element.querySelector(selector);
		},

		addViews: function(template) {
			var ph = Defaults.viewPlaceholder;
			for (var k = 1; k < arguments.length; k++) {
				if (arguments[k] !== null) {
					if ((typeof(arguments[k]) === 'string') || (typeof(arguments[k]) === 'boolean') || (typeof(arguments[k]) === 'number')) {
						template = template.replace(ph, arguments[k]);
					} else if ((arguments[k].isExtends('View')) || (arguments[k]._class === "View")) {
						template = template.replace(ph, "<div class='view-placeholder'></div>");
					}
				}
			}
			var elementHandler = document.createElement('div');
			elementHandler.innerHTML = template;
			for (var i = 1; i < arguments.length; i++) {
				if (arguments[i] !== null) {
					if ((arguments[i].isExtends) && ((arguments[i].isExtends('View')) || (arguments[i]._class === "View"))) {
						var view = arguments[i];
						if ((typeof(this.delegate) !== 'undefined') && (view.delegate === null) && (this.delegate !== null) && (this._class !== 'Viewport')) {
							view.setDelegate(this.delegate);
						}
						if ((typeof(this.model) !== 'undefined') && (view.model === null) && (this.model !== null) && (this._class !== 'Viewport')) {
							view.setModel(this.model);
						}
						view.render();
						var replacableNode = elementHandler.querySelector(".view-placeholder");
						var replacableParentNode = replacableNode.parentNode;
						replacableParentNode.appendChild(view.element);
						replacableParentNode.removeChild(replacableNode);
					}
				}
			}
			if ( elementHandler.hasChildNodes()) {
				while ( elementHandler.childNodes.length >= 1 ) {
					this.element.appendChild(elementHandler.firstChild);
				}
			}
		},

		clearViews: function() {
			var cell = this.element;
			if ( cell.hasChildNodes()) {
				while ( cell.childNodes.length >= 1 ) {
					cell.removeChild(cell.firstChild);
				}
			}
		},
		removeView: function() {
			this.element.parentNode.removeChild(this.element);
		},
		addEvent: function(selector, eventType, eventName) {
			var _self = this;
			var elements = this.element.querySelectorAll(selector);
			if (elements.length === 0) {
				elements = [this.element];
			}
			for (var i = 0; i < elements.length; i++) {
				elements[i][eventType] = (function() {
					return function(evt) {
						_self.handleEvents.apply(_self,[evt,eventName]);
					};
				}).apply(_self);
			}
		},
		handleEvents: function(eventObject, eventName) {
			Throw(new UnsupportedOperationException('handleEvents'));
		},
		render: function() {
			return this.element;
		}
	});

	Class('Viewport::View', {

		width: window.innerWidth,
		height: window.innerHeight,

		init: function(delegate) {
			this.delegate = delegate;
			var _self = this;
			this.element = document.body;
			if (document.addEventListener) {
				window.addEventListener( "load", function(){
					_self.callDelegate('didBecomeActive', [_self]);
				}, false );
			} else {
				window.attachEvent( "onload", function() {
					_self.callDelegate('didBecomeActive', [_self]);
				});
			}
			document.body.onbeforeunload = function() {
				_self.callDelegate('willResignActive');
			};
			document.body.onunload = function() {
				_self.callDelegate('willTerminate');
			};
		}
	});

	/*
	*
	*	Global Variables
	*
	*/
	window.Class = Class;
	window.Throw = Throw;
	window.Catch = Catch;
})();
