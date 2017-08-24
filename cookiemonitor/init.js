console.clear()
console.log('Cookie monitor started')

var cookieToLookfor = ['referrer', 'accept_language'];

chrome.webRequest.onHeadersReceived.addListener(function(details){
  if(details.responseHeaders) {       

    for(let i in details.responseHeaders){
      let header = details.responseHeaders[i];
      if(header.name === "Set-Cookie") {
        let headerValues = header.value.split(";");
        let cookieNameAndVal = headerValues[0].trim();
        let cookieVals = cookieNameAndVal.split("=");
        let cookieDomain = headerValues[1].trim().split("=");
        let domain;
        if(cookieDomain[0] === "Domain") {
          domain = cookieDomain[1];
        }
        let cookie = {name: cookieVals[0], value: cookieVals[1], domain: domain}

        if(cookieToLookfor.indexOf(cookie.name) > -1) {
          console.warn('### COOKIE CHANGED:', cookie.name, cookie.value, details.url)
        }
      }
    }
  }
}, {urls: ["*://*/*"]}, ["responseHeaders"]);
