(function(){
	Class('Website', {

		myCodeMirror: null,
		currentPageElement: null,

		playCode: function() {
			var scriptElem = $('<script type="text/javascript" ></script>');
			var code = "window['executeCode'] = function() { var scriptOutput = ''; var out = function(str){ scriptOutput += str; };" + this.myCodeMirror.getValue() + " return scriptOutput; }";
			scriptElem.text(code);
			$(document).append(scriptElem);
			var result = window['executeCode']();
			scriptElem.remove();
			$("#code-script").text("");
			// show modal
			$('#code-run-modal').modal();
			$('#code-run-modal').find(".modal-body").text(result);
		},

		loadCodeEditor: function() {
			$("#editor").css("display", "block");
			this.myCodeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
				theme: 'lesser-dark',
				lineNumbers: true,
				matchBrackets: true
			});
			$("#editor").css("display", "none");
		},
		
		switchContentPage: function(contentElement) {
			this.currentPageElement.css("display","none");
			this.currentPageElement = contentElement;
			this.currentPageElement.css("display","block");
			var _self = this;
			this.currentPageElement.css("opacity", "0");
			setTimeout(function(){
				_self.currentPageElement.css("opacity", "1");
			}, 50);
		},

		createBoilerplate: function() {
			$(".boilerplate-container").empty();
			var progressBar = $(".progress .bar");
			var progressBarContainer = $(".progress");
			progressBarContainer.removeClass("hidden");
			progressBar.css("width","70%");
			var _self = this;
			setTimeout(function(){
				progressBar.css("width","100%");
				setTimeout(function(){
					progressBar.css("width","0");
					progressBarContainer.addClass("hidden");
					_self.getBoilerplate();
				},1000);
			},1000);
		},

		downloadFile: function(name, codeElement) {
			
		},

		getBoilerplate: function() {
			var applicationLabel = $("#appNameInput").attr('value');
			var applicationName = applicationLabel.replace(" ","-");
			// Start to create the boilerplate
			var _self = this;
			$.get("boilerplate/MyApplication/index.html",function(data){
				data = data.replace(/@@@application-label@@@/g,applicationLabel);
				data = data.replace(/@@@application-name@@@/g,applicationName);
				$(".boilerplate-container").append($('<span class="explenation">'+applicationName+'/index.html</span>'));
				var downloadButton = $('<span class="btn">Download</span>');
				$(".boilerplate-container").append(downloadButton);
				var code = $("<pre/>").append("<code />");
				downloadButton.mouseup(function(){
					_self.downloadFile('index.html',code)
				});
				code.text(data);
				$(".boilerplate-container").append(code);	
			});

			$.get("boilerplate/MyApplication/js/application.js",function(data){
				data = data.replace(/@@@application-label@@@/g,applicationLabel);
				data = data.replace(/@@@application-name@@@/g,applicationName);
				$(".boilerplate-container").append($('<span class="explenation">'+applicationName+'/js/application.js</span>'));
				var downloadButton = $('<span class="btn">Download</span>');
				$(".boilerplate-container").append(downloadButton);
				var code = $("<pre/>").append("<code />");
				downloadButton.mouseup(function(){
					_self.downloadFile('application.js',code)
				});
				code.text(data);
				$(".boilerplate-container").append(code);	
			});

			$.get("boilerplate/MyApplication/css/application.css",function(data){
				data = data.replace(/@@@application-label@@@/g,applicationLabel);
				data = data.replace(/@@@application-name@@@/g,applicationName);
				$(".boilerplate-container").append($('<span class="explenation">'+applicationName+'/css/application.css</span>'));
				var downloadButton = $('<span class="btn">Download</span>');
				$(".boilerplate-container").append(downloadButton);
				var code = $("<pre/>").append("<code />");
				downloadButton.mouseup(function(){
					_self.downloadFile('application.css',code)
				});
				code.text(data);
				$(".boilerplate-container").append(code);	
			});

			$.get("boilerplate/MyApplication/lib/stackjs.min.js",function(data){
				$(".boilerplate-container").append($('<span class="explenation">'+applicationName+'/lib/stackjs.js</span>'));
				var downloadButton = $('<span class="btn">Download</span>');
				$(".boilerplate-container").append(downloadButton);
				var code = $("<pre/>").append("<code />");
				downloadButton.mouseup(function(){
					_self.downloadFile('stackjs.min.js',code)
				});
				code.text(data);
				$(".boilerplate-container").append(code);
			});
		}

	});

	$(document).ready(function(){
		window.website = new Website();
		window.website.loadCodeEditor();
		website.setCurrentPageElement($("#home"));
	});
})();