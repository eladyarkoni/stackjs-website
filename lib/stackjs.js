/**
*
*	StackJS Framework Version 0.0.2
*	Author: Elad Yarkoni
*
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
		stackSize: 50
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
	* StackJS Library
	*
	*********************************************************/
	Class(Defaults.defaultObjectName, {

		delegate: null,

		callDelegate: function(methodName,params) {
			if ((this.delegate !== null) && (typeof(this.delegate[methodName]) !== 'undefined')) {
				this.delegate[methodName].apply(this.delegate, params);
			}	
		}

	}); 

	Class('Exception',{
		message: null,
		Exception: function(message) {
			this.message = message;
		},
		toString: function() {
			return "Exception: " + this._class + " '" + this.message + "'";
		}
	});

	Class('StoryBoard',{
		
		load: function(json) {
			console.log("storyboard is activated");	
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
