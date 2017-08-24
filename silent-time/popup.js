document.addEventListener('DOMContentLoaded', function() {
  var input = document.getElementById('startTime');
  input.value = localStorage.getItem('beginTime');

  var saveButton = document.getElementById('saveButton');
  saveButton.onclick = function(){
    var value = input.value;
    localStorage.setItem('beginTime', value);
    chrome.runtime.reload();
  }
});