function drawPullRequests (data) {
  console.log(data);
  const innerWidth = window.innerWidth - 10;
  const innerHeight = window.innerHeight - 20;
  const userBlockHeight = 0.94 * (innerHeight / data.length);

  const plLineHeight = (count) => {
    const height = userBlockHeight/count;
    return height > 4 ? 4 : height;
  };

  const setPlStatus = d => {
    const approved = d.approved ? '[approved] ' : '';
    setStatus(`${Math.floor(d.lifeHours/24)}d - ${approved}${d.title}`)
  };

  const openPlInTab = d => {
    chrome.tabs.create({ url: d.link });
  };

  const getManColor = (authorId) => {
    return d3.schemeTableau10[authorId % 10];
  };

  // drawing.....
  const svg = d3.select(document.body).append('svg')
    .attr("viewBox", [-innerWidth / 2, 0, innerWidth, innerHeight])
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .attr("style", "margin: 5px")

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.plMaxLifeHours)])
    .range([0, innerWidth/2])

  const y = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([0, innerHeight])
    // .padding(0.1)
  
  // avatar image defenitions
  svg.append("g")
    .append("defs")
    .selectAll("avatars")
    .data(data)
    .join("pattern")
      .attr("id", d => d.name)  
      .attr("x", 0)
      .attr("y", 0)
      .attr("patternUnits", "objectBoundingBox")
      .attr("height", 1)
      .attr("width", 1)
      .append("image")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", userBlockHeight)
        .attr("width",  userBlockHeight)
        .attr("xlink:href", d => d.avatar)


  // pullrequests: REVIEWER -----------------------------------
  svg.append("g") // pullrequests
    .selectAll("man")
    .data(data)
      .join("g")
      .attr("transform", (d, i) => `translate(${userBlockHeight/2} ${y(i)})`)
      .selectAll("pullreq")
      .data(d => d.plReviewer)
      .join("rect")
        .attr("style", "cursor: crosshair")
        .attr("fill", d => d.approved ? "lightgray" : getManColor(d.authorId))
        .attr("x", 0)
        .attr("y", (d, i, all) => i * plLineHeight(all.length))
        .attr("width", d => x(d.lifeHours))
        .attr("height", (d, i, all) => plLineHeight(all.length))
        .on("mouseover", setPlStatus)
        .on("click", openPlInTab)


  // pullrequests: AUTHOR -----------------------------------
  svg.append("g")
    .selectAll("man")
    .data(data)
      .join("g")
      .attr("transform", (d, i) => `translate(${-userBlockHeight/2} ${y(i)})`)
      .attr("fill", d => getManColor(d.authorId))
      .selectAll("pullreq")
      .data(d => d.plAuthor)
      .join("rect")
        .attr("style", "cursor: crosshair")
        .attr("x", d => -x(d.lifeHours))
        .attr("y", (d, i, all) => (i * plLineHeight(all.length)))
        .attr("width", d => x(d.lifeHours))
        .attr("height", (d, i, all) => plLineHeight(all.length))
        .on("mouseover", setPlStatus)
        .on("click", openPlInTab)


  // man
  svg.append("g")
    .selectAll("man")
    .data(data)
    .join("rect")
      .attr("fill", d => `url('#${d.name}')`)
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .attr("x", x(0) - userBlockHeight/2)
      .attr("y", (d, i) => y(i))
      .attr("width", userBlockHeight)
      .attr("height", userBlockHeight)
      .on("mouseover", d => setStatus(`${d.name}, author:${d.plAuthor.length}, reviewer: ${d.plReviewer.length}`))
  
  document.body.append(svg.node()) 

}