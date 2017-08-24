var checkInterval = 1000;
setInterval(checkForSilentTime, checkInterval);

var beginTime = localStorage.getItem('beginTime');
if(beginTime){
  beginTime = beginTime.split(',');
}

if(!(beginTime instanceof Array)){
  beginTime = [];
}

var timerPath = chrome.extension.getURL('timer.html');


function checkForSilentTime(){
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  var s = now.getSeconds();

  // console.log(h,m,s, beginTime);
  for(var idx in beginTime){
    var timeParts = beginTime[idx].split(':');
    
    if(h == +timeParts[0] && m == +timeParts[1] && s == +timeParts[2]){
      pushBackTime(beginTime.splice(idx, 1)[0]);
      openTimer();
      break;
    }
  }
}

function openTimer(){
  chrome.tabs.create({
    url: timerPath
  });
}

function pushBackTime(time){
  setTimeout(function(){
    beginTime.push(time);
  }, 2*checkInterval);
}


