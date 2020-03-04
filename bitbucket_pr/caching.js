const CACHETIME = 7*60*1000;

function getCachedData(key) {
	const storageData = window.localStorage[key];
	if (!storageData) {
		return;
	}
	const storage = JSON.parse(storageData);

	if (!storage.ts || storage.ts < Date.now()) {
		return;
	}

	return storage.data;
}

function setCachedData(key, data) {
	window.localStorage[key] = JSON.stringify({
		ts: Date.now() + CACHETIME,
		data: data,
	});
}