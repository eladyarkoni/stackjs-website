// Notification Object
Class('NSNotification', {
	
	object: null,
	name: null,
	NSNotification: function(name, object) {
		this.name = name;
		this.object = object;
	}

});

// Notification Center
Class('NSNotificationCenter', {
	
	_observers: [],
	
	addObserver: function(observer, method, notificationName) {
		this._observers.push({
			name: notificationName,
			observer: observer,
			method: method
		});
	},

	postNotificationName: function(name, object) {
		for (var i = 0; i < this._observers.length; i++) {
			if (this._observers[i].name === name) {
				this._observers[i].observer[this._observers[i].method](new NSNotification(name, object));
			}
		}
	},

	// make the notification center as singleton and get default center
	defaultCenter: function() {
		return this._sharedInstance;
	}
});