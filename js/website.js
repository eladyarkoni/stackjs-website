(function(){
	Class('Website', {

		currentPageElement: null,
		
		switchContentPage: function(contentElement){
			this.currentPageElement.css("display","none");
			this.currentPageElement = contentElement
			this.currentPageElement.css("display","block");
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

			$.get("boilerplate/MyApplication/js/notification-center.js",function(data){
				data = data.replace(/@@@application-label@@@/g,applicationLabel);
				data = data.replace(/@@@application-name@@@/g,applicationName);
				$(".boilerplate-container").append($('<span class="explenation">'+applicationName+'/js/notification-center.js</span>'));
				var downloadButton = $('<span class="btn">Download</span>');
				$(".boilerplate-container").append(downloadButton);
				var code = $("<pre/>").append("<code />");
				downloadButton.mouseup(function(){
					_self.downloadFile('notification-center.js',code)
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
		website.setCurrentPageElement($("#home"));	
	});
})();