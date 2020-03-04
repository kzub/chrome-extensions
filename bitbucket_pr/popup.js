// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
const getCurrentTabUrl = async () => {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  return new Promise((resolve, reject) => {
    chrome.tabs.query(queryInfo, function(tabs) {
      const tab = tabs[0];
      const url = tab.url;

      // tab.url is only available if the "activeTab" permission is declared.
      // If you want to see the URL of other tabs (e.g. after removing active:true
      // from |queryInfo|), then the "tabs" permission is required to see their
      // "url" properties.
      if (typeof url !== 'string') {
        reject('tab.url should be a string');
        return;
      }

      resolve(url);
    });
  });
};

const getJSON = async (url) => {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('GET', url);
    x.responseType = 'json';
    x.onload = function() {
      if (!x.response) {
        reject('no response');
        return;
      }

      resolve(x.response);
    };

    x.onerror = function() {
      reject('network error');
    };
    x.send();
  });
};


function setStatus(text) {
  document.getElementById('status').textContent = text;
}

const loadPL = async (user, repo, query, pullrequests, page, percent = 0) => {
  setStatus(`loading ${user}/${repo} (${percent}%)`);
  const data = await getJSON(`https://bitbucket.org/!api/2.0/repositories/${user}/${repo}/pullrequests/?pagelen=25&fields=%2Bvalues.participants&q=${query}&page=${page}`);
  console.log(data)

  pullrequests.push.apply(pullrequests, data.values);

  if (data.size > data.pagelen * data.page) {
    return loadPL(user, repo, query, pullrequests, page + 1, Math.floor(100*(data.page * data.pagelen) / data.size));
  }
  return pullrequests;
}

document.addEventListener('DOMContentLoaded', async function() {
  const url = await getCurrentTabUrl();

  if (!url.startsWith('https://bitbucket.org/')) {
    setStatus('not a bitbucket Tab');
    return;
  }

  const [,,, user, repo] = url.split('/');

  let pullrequests = getCachedData(`${user}/${repo}/open`);
  if (!pullrequests) {
    pullrequests = await loadPL(user, repo, 'state%3D%22OPEN%22', [], 1);
    setCachedData(`${user}/${repo}/open`, pullrequests);
  }

  setStatus(`${pullrequests.length} pull requests loaded`);

  drawPullRequests(buildData(pullrequests));

});
