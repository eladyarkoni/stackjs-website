/*
* Name: @@@application-name@@@
* Description: Main Application Object
*
*
*/

/*		Application Model		*/
Class('Task', {
	label: null,
	completed: false,
	Task: function(label, completed) {
		this.label = label;
		this.completed = completed;
	},
	toJson: function() {
		return {
			label: this.label,
			completed: this.completed
		};
	}
});

Class('TaskList', {
	tasks: [],
	TaskList: function(jsonObj) {
		if (jsonObj !== null) {
			for (var i = 0; i < jsonObj.tasks.length; i++) {
				this.tasks.push(new Task(
					jsonObj.tasks[i].label,
					jsonObj.tasks[i].completed
				));
			}
		}
	},
	addTask: function(label) {
		this.tasks.push(new Task(label, false));
	},
	size: function() {
		return this.tasks.length;
	},
	removeTask: function(task) {
		for (var i = 0; i < this.tasks.length; i++) {
			if (task === this.tasks[i]) {
				this.tasks.splice(i, 1);
				return;
			}
		}
	},
	toJson: function() {
		var json = { tasks: [] };
		for (var i = 0; i < this.tasks.length; i++) {
			json.tasks.push(this.tasks[i].toJson());
		}
		return json;
	}
});

Class('TaskListTableCell::View', {
	render: function() {
		this.addClasses("task");
		this.addViews("<input type='checkbox' $></input><span class='$'>$</span><span class='close'>x</span>",
				(this.getModel().getCompleted()) ? 'checked' : '',
				(this.getModel().getCompleted()) ? 'checked' : '',
				this.getModel().getLabel());
		this.addEvent("input", "onchange", "changeTaskState");
		this.addEvent(".close", "onclick", "deleteTask");
	},
	handleEvents: function(evt, eventName) {
		switch (eventName) {
			case "changeTaskState":
				this.callDelegate("didChangeTaskState", [this.getModel()]);
				this.getViews("span").className = (this.getModel().getCompleted() ? 'checked' : '');
			break;
			case "deleteTask":
				this.callDelegate("didRemoveTask", [this.getModel()]);
				this.removeView();
			break;
		}
	}
});

/*		Application Views		*/
Class('TaskListTable::View', {
	render: function() {
		this.clearViews();
		this.addClasses("task-table");
		var tasks = this.getModel().getTasks();
		for (var i = 0; i < tasks.length; i++) {
			var taskTableCell = new TaskListTableCell();
			taskTableCell.setModel(tasks[i]);
			this.addViews('$', taskTableCell);
		}
	}
});

Class('MainPage::View', {
	taskStr: '',
	taskListTable:  new TaskListTable(),
	render: function() {
		this.addClasses('todos-container');
		this.addViews("<div class='title'>$</div>", "Todos");
		this.addViews("<input type='text' placeholder='What needs to be done?'></input>");
		this.addViews("<div class='task-table-container'>$</div>", this.taskListTable);
		this.addEvent("input", "onkeyup", "taskEnteredEvent");
		this.addEvent("input", "onkeydown", "taskChangedEvent");
	},
	handleEvents: function(evt, eventName) {
		switch (eventName) {
			case "taskEnteredEvent":
				if (evt.keyCode === 13) {
					this.callDelegate("didTaskEntered",[this.taskStr]);
					this.taskListTable.render();
				}
			break;
			case "taskChangedEvent":
				this.taskStr = evt.target.value;
			break;
		}
	}
});

/*		Application Object		*/
Class('Application', {
	model: null,
	view: null,
	loadSavedData: function() {
		var savedData = window.localStorage.getItem("savedData");
		this.model = new TaskList(JSON.parse(savedData));
	},
	saveData: function() {
		window.localStorage.setItem("savedData", JSON.stringify(this.model.toJson()));
	},
	/* MainPage delegation methods */
	didTaskEntered: function(taskLabel) {
		this.model.addTask(taskLabel);
		this.saveData();
	},
	didRemoveTask: function(task) {
		this.model.removeTask(task);
		this.saveData();
	},
	didChangeTaskState: function(task) {
		task.setCompleted(task.getCompleted() ? false : true);
		this.saveData();
	},
	/* Viewport delegation methods */
	didBecomeActive: function() {
		this.view = new MainPage(this);
		this.loadSavedData();
		this.view.setDelegate(this);
		this.view.setModel(this.model);
		Viewport().addViews('$',this.view);
	}
});