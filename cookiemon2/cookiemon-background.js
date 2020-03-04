
chrome.browserAction.onClicked.addListener(function(tab) {
  var monitorurl = chrome.extension.getURL('cookiemon.html');
  focusOrCreateTab(monitorurl);
});

function focusOrCreateTab(url) {
  chrome.windows.getAll({"populate":true}, function(windows) {
   var existingTab; 
   for(var i in windows) {
      var tabs = windows[i].tabs;
      for(var j in tabs) {
        var tab = tabs[j];
        if(tab.url == url) {
        	existingTab = tab;
        	break;
        }
      }
    }
    if(existingTab) {
      chrome.tabs.update(existingTab.id, {"selected":true});
    } else {
      chrome.tabs.create({"url":url, "selected":true});
    }
  });
}

chrome.cookies.onChanged.addListener(function(info) {
	chrome.storage.local.get("cookiemon_pairs", function(result) {
		var cookieMonPairs = result.cookiemon_pairs;
		var cookie = info.cookie;
		var result = isExists(cookie, cookieMonPairs);
		if(result === true) {
			var jsonStr = JSON.stringify(info);
			console.log('BRRR', info)
			logData(cookie, jsonStr);
		}
	});
});

chrome.webRequest.onHeadersReceived.addListener(function(details){
	if(details.responseHeaders) {		
		chrome.storage.local.get("cookiemon_pairs", function(result) {
			var cookieMonPairs = result.cookiemon_pairs;

			var i = 0;
			var len = details.responseHeaders.length;
			while(i < len) {
				var header = details.responseHeaders[i];
				if(header.name === "Set-Cookie") {
					var headerValues = header.value.split(";");
					var cookieNameAndVal = headerValues[0].trim();
					var cookieVals = cookieNameAndVal.split("=");
					var cookieDomain = headerValues[1].trim().split("=");
					var domain;
					if(cookieDomain[0] === "Domain") {
						domain = cookieDomain[1];
					}
					var cookie = {name: cookieVals[0], value: cookieVals[1], domain: domain}

					var exists = isExists(cookie, cookieMonPairs);
					if(exists === true) {
						var value = cookieVals[1];
						var data = {"url": details.url, "method": details.method};
						console.log('HUUU:', details.url);
						
						logData(cookie, JSON.stringify(data));
					}
				}
				i++;
			}
		});
	}
}, {urls: ["*://*/*"]}, ["responseHeaders"]);

function logData(cookie, data) {
	chrome.storage.local.get("cookiemon_logs", function(result){
		var cookieMonLogs = result.cookiemon_logs;
		if(!cookieMonLogs) {
			cookieMonLogs = {};
		}
		var key = cookie.name + "_" + cookie.value + "_" + cookie.domain;
		if(!cookieMonLogs[key]) {
			cookieMonLogs[key] = [];
		}

		var cdata = {};
		cdata['cookie'] = cookie;
		cdata['data'] = data;
		var date = new Date();
		var res = {};
		res[date] = cdata;
		cookieMonLogs[key].push(res);
		
		chrome.storage.local.set({"cookiemon_logs": cookieMonLogs}, function() {
			console.log("@@@@CookieMon: Saved @ " + date + "-" + data);
		});
		alert("Monitored Cookie " + cookie.name + " (" + cookie.domain + ") is added / removed @ " + date + ". - " + data); 
	});
}

function isExists(cookie, cookieMonPairs) {
	if(cookieMonPairs) {
		for(var domain in cookieMonPairs) {
			var dreg = new RegExp(domain);
			var res = cookie.domain ? dreg.test(cookie.domain) : false;
			if(res === true) {
				var cookies = cookieMonPairs[domain];
				for(var i in cookies) {
					var pairCookie = cookies[i];
					var creg = new RegExp(pairCookie);
					var ckreg = cookie.name + "=" + cookie.value;
					var cres = creg.test(ckreg);
					if(cres === true) {
						return true;
					}
				}
			}
		}
	}
	return false;
}
