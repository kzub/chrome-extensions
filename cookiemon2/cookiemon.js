document.addEventListener('DOMContentLoaded', function() {
	
	document.getElementById('cookiemon_addpairfrm').addEventListener('submit', function() {
		if(!this.cookiename.value) {
			alert("Enter a valid cookie name");
		} else if(!this.cookiedomain.value) {
			alert("Enter a valid cookie domain");
		} else if(!this.cookievalue.value) {
                        alert("Enter a valid cookie value");
                } else {
			var domain = this.cookiedomain.value;
			var name = this.cookiename.value;
			var value = this.cookievalue.value;
			addCookieMonPair(domain, name, value);
		}
		return false;
	});

	document.getElementById('hideall').addEventListener('click', function() {
		 document.getElementById('cmhistory').style.display='none';
		document.getElementById('showalldiv').style.display='';
	});

	document.getElementById('showall').addEventListener('click', function() {
		chrome.storage.local.get("cookiemon_logs", function(result){
			document.getElementById('cmhistory').style.display='';
			document.getElementById('showalldiv').style.display='none';
			var ele = document.getElementById('cmhistorytable');

			var cookieMonLogs = result.cookiemon_logs;
			if(!cookieMonLogs) {
				var trow = document.createElement("tr");
				var td = document.createElement("td");
				td.setAttribute("colspan", "5");
				var txtnode = document.createTextNode('--No Data--');
				td.appendChild(txtnode);
				trow.appendChild(td);		
				ele.appendChild(trow);

			} else {
				for(var entry in cookieMonLogs) {
					var logs  = cookieMonLogs[entry];
					for(var log in logs) {
						var datepair = logs[log];
						for(var date in datepair) {
							var trow = document.createElement("tr");

							//Date
                                			var datetd = document.createElement("td");
                                			var datetxtnode = document.createTextNode(date);
                                			datetd.appendChild(datetxtnode);
                                			trow.appendChild(datetd);

							var cdata = datepair[date];

							//Name
                                                	var nametd = document.createElement("td");
                                                	var nametxtnode = document.createTextNode(cdata.cookie.name);
                                                	nametd.appendChild(nametxtnode);
                                                	trow.appendChild(nametd);

							//Value
                                                	var valuetd = document.createElement("td");
                                           	     	var valuetxtnode = document.createTextNode(cdata.cookie.value);
                                                	valuetd.appendChild(valuetxtnode);
                                                	trow.appendChild(valuetd);

							//Domain
                                                	var domaintd = document.createElement("td");
                                            	    	var domaintxtnode = document.createTextNode(cdata.cookie.domain);
                                                	domaintd.appendChild(domaintxtnode);
                                                	trow.appendChild(domaintd);

							//Data
                                                	var datatd = document.createElement("td");
                     	                           	var datatxtnode = document.createTextNode(cdata.data);
                                                	datatd.appendChild(datatxtnode);
                                                	trow.appendChild(datatd);

							ele.appendChild(trow);
						}
					}
				}
			}
		});
		return false;
	});

	document.getElementById('flushall').addEventListener('click', function() {
        	chrome.storage.local.remove("cookiemon_logs", function(){
                        alert("All history deleted...");
			location.reload(true);
                });
		return false;
	});
	
	function addCookieMonPair(domain, name, value) {
		chrome.storage.local.get("cookiemon_pairs", function(result){
			var cookieMonPairs = result.cookiemon_pairs;
			if(!cookieMonPairs) {
				cookieMonPairs = {};
				cookieMonPairs[domain] = [];
			} else {
				var cookies = cookieMonPairs[domain];
				if(!cookies) {
					cookieMonPairs[domain] = [];
				}
			}
			var pair = name + "=" + value;
			cookieMonPairs[domain].push(pair);
			chrome.storage.local.set({"cookiemon_pairs" : cookieMonPairs}, function() {
				alert("A Cookie monitoring pair added");
				location.reload(true);
			});
		});
	}
	
	var loadCookieMonPairs = (function() {
		chrome.storage.local.get("cookiemon_pairs", function(result) {
			var cookieMonPairs = result.cookiemon_pairs;
			var exists = false;
			if(cookieMonPairs) {
				for(var domain in cookieMonPairs) {
					var cookies = cookieMonPairs[domain];
					if(cookies) {
						for(var i in cookies) {
							if(exists === false) {
								createDeleteAll();
							}
							var pair = cookies[i];
							createDivAndAction(domain, pair);
							exists = true;
						}
					}
				}
			}
			if(exists === false) {
				document.getElementById("cookiemon_deletepair").innerHTML="--No Data--";
			}
		});
	}) ();
	
	function createDeleteAll() {
		var deleteButton = document.createElement("input");
		deleteButton.setAttribute("type", "button");
		deleteButton.setAttribute("value", "Delete All");
		deleteButton.setAttribute("style", "padding: 5px");
		var id = "cookiemon_deleteallpairs";
		deleteButton.setAttribute("id", id);
		document.getElementById("cookiemon_deletepair").appendChild(deleteButton);
		document.getElementById(id).addEventListener("click", function() {
			removeAll();
		});
	}
	
	function createDivAndAction(domain, pair) {
		var div = document.createElement("div");
		div.setAttribute("style", "padding: 5px");
		
		var txt = pair + " (" + domain + ") ";
		var txtnode = document.createTextNode(txt);
		div.appendChild(txtnode);
		
		var deleteButton = document.createElement("input");
		deleteButton.setAttribute("type", "button");
		deleteButton.setAttribute("value", "Delete");
		var id = pair+"_"+domain;
		deleteButton.setAttribute("id", id);
		
		div.appendChild(deleteButton);
		
		document.getElementById("cookiemon_deletepair").appendChild(div);
		document.getElementById(id).addEventListener("click", function() {
			remove(pair, domain);
		});
	}
	
	function remove(name, domain) {
		chrome.storage.local.get("cookiemon_pairs", function(result){
			var deleted = false;
			var cookieMonPairs = result.cookiemon_pairs;
			if(cookieMonPairs) {
				var cookies = cookieMonPairs[domain];
				if(cookies) {
					var i=0;
					while(i < cookies.length) {
						if(cookies[i] == name) {
							cookieMonPairs[domain].splice(i, 1);
							deleted = true;
						} else {
							i++;
						}
					}
					if(cookieMonPairs[domain].length == 0) {
						delete cookieMonPairs[domain];
						deleted = true;
					}
				}
			}
			if(deleted === true) {
				chrome.storage.local.set({"cookiemon_pairs": cookieMonPairs}, function() {
					alert("A Cookie monitoring pair deleted");
					location.reload(true);
				});
			}
		});
	}
	
	function removeAll() {
		chrome.storage.local.remove("cookiemon_pairs", function(){
			alert("All pairs deleted...");
			location.reload(true);
		});
	}
});
