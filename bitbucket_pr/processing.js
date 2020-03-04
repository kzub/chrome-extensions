const createManFromBBUser = (user) => {
	return {
		name: user.display_name,
		avatar: user.links.avatar.href,
		plAuthor: [],
		plReviewer: [],
		plMaxLifeHours: 0,
		plAuthorLHSum: 0,
		plReviewerLHSum: 0
	};
}

let manIndex = 0;
const getMan = (people, user) => {
	if (!people[user.display_name]) {
		people[user.display_name] = {
			...createManFromBBUser(user),
			authorId: manIndex++,
		};
	}
	return people[user.display_name];
};

const createPullReq = (authorId, pl) => {
	return {
		author: pl.author.display_name,
		authorId: authorId,
		link: pl.links.html.href,
		createdOn: pl.created_on,
		state: pl.state,
		title: pl.title,
		commentCount: pl.comment_count,
		participantsCount: pl.participants.length,
		lifeHours: Math.round((Date.now() - (new Date(pl.created_on)).valueOf())/1000/60/60),
	};
};

const byCreation = (a, b) => (new Date(b.createdOn)).valueOf() - (new Date(a.createdOn)).valueOf();
const byRewiewLHSum = (a, b) => b.plReviewerLHSum - a.plReviewerLHSum;

function buildData (pullrequests) { // eslint-disable-line
	const people = {};

	for (const pullreq of pullrequests) {
		let man = getMan(people, pullreq.author);
		const pl = createPullReq(man.authorId, pullreq);
		man.plAuthor.push(pl);

		for (const participant of pullreq.participants) {
			if (participant.role === 'REVIEWER') {
				man = getMan(people, participant.user);
				man.plReviewer.push({
					...pl,
					approved: participant.approved,
				});
			}
		}
	}

	for (const man of Object.values(people)) {
		man.plAuthorLHSum = man.plAuthor.reduce((acc, item) => acc + item.lifeHours, 0);
		man.plReviewerLHSum = man.plReviewer.reduce((acc, item) => acc + item.lifeHours, 0);

		man.plMaxLifeHours = Math.max(
			Math.max.apply(this, man.plAuthor.map(d => d.lifeHours)),
			Math.max.apply(this, man.plReviewer.map(d => d.lifeHours))
		);

		man.plAuthor.sort(byCreation);
		man.plReviewer.sort(byCreation);
	}

	const result = Object.values(people);
	result.sort(byRewiewLHSum);

	return result;
}