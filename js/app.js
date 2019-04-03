

    var margin = { left:80, right:20, top:50, bottom:100 };
    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var time = 0;
    var xScale;
    var yScale;
    var area;
    var continentColor;
    var timeLabel;
    var xAxisCall;
    var yAxisCall;
    var myTip;
    var interval;
    var formattedData;
    var playing = true;
    var selectedCountry = 'All';


   var svgBarChart = d3.select('#chart-area')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
  
      const g = svgBarChart.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      myTip = d3.tip().attr('class', 'd3-tip').html((d) => {
        return `<strong>Country: </strong><span>${d.country}</span><br /><strong>Continent: </strong><span>${d.continent}</span>`;
      });
      g.call(myTip);
  
      xScale = d3.scaleLog()
        .base(10)
        .range([0, width])
        .domain([142, 150000]);

      yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, 90]);

      area = d3.scaleLinear()
            .range([25 * Math.PI, 1500 * Math.PI])
            .domain([2000, 1400000000]);
  
      continentColor = d3.scaleOrdinal(d3.schemeCategory10);
  
      g.append('text')
            .attr('y', height + 50)
            .attr('x', width / 2)
            .attr('font-size', '20px')
            .attr('text-anchor', 'middle')
            .text('GDP Per Capita ($)');
      g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -170)
            .attr('font-size', '20px')
            .attr('text-anchor', 'middle')
            .text('Life Expectancy (Years)');
      this.timeLabel = g.append('text')
            .attr('y', height - 10)
            .attr('x', width - 40)
            .attr('font-size', '40px')
            .attr('opacity', '0.4')
            .attr('text-anchor', 'middle')
            .text('1800');
  
      g.append('g').attr('class', 'x axis');
  
      g.append('g').attr('class', 'y-axis');
  
      xAxisCall = d3.axisBottom(xScale)
        .tickValues([400, 4000, 40000])
        .tickFormat(d3.format('$'));

      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height} )`)
        .call(xAxisCall);
  
      yAxisCall = d3.axisLeft(yScale)
        .tickFormat((d) => { return + d; });
      g.append('g')
        .attr('class', 'y axis')
        .call(yAxisCall);
  
      const continents = ['europe', 'asia', 'americas', 'africa'];
  
      const legend = g.append('g').attr('transform', `translate(${ width - 10 }, ${height - 125})`);
  
      continents.forEach((continent, i) => {
        const legendRow = legend.append('g').attr('transform', `translate(0, ${i * 20})`);
  
        legendRow.append('rect').attr('width', 10).attr('height', 10).attr('fill', continentColor(continent));
        legendRow.append('text').attr('x', -10).attr('y', 10).attr('text-anchor', 'end').style('text-transform', 'capitalize').text(continent);
      });
  
      d3.json('http://localhost/data.json').then((data) => {

      console.log(data);
  
        formattedData = data.map((year) => {
          return year['countries'].filter((country) => {
            const dataExists = (country.income && country.life_exp);
            return dataExists;
          }).map((country) => {
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;
          });
        });
  
        updateD3Data(formattedData[0], 'All');
  
      }).catch((error) => { console.log(error); });
  
  


    function play() {

       playing = !playing;

       !playing ? interval = setInterval(() => { step(formattedData); }, 100) : clearInterval(interval);
    }
  
    function reset() {
      time = 0;
      updateD3Data(formattedData[0], 'All');
    }
  
    function step(data) {
      time = (time < 214) ? time + 1 : 0;
      updateD3Data(data[time], selectedCountry);
    }
  
    function selectCountry(e) {
      selectedCountry = e.currentTarget.value ;
      if (!playing) {
      updateD3Data(formattedData[time], e.currentTarget.value);
      }
    }
  
    function updateD3Data(data, selectedCont) {
      const t = d3.transition()
      .duration(300);
  
      const filteredData = data.filter((d) => {
        return selectedCont === 'All' ? true : d.continent === selectedCont;
      });
  
      const circles = svgBarChart.select('g').selectAll('circle').data(filteredData, (d) => {
        return d.country;
      });
  
      circles.exit()
          .attr('class', 'exit')
          .remove();
  
      circles.enter()
          .append('circle')
          .attr('class', 'enter')
          .attr('fill', (d) => { return continentColor(d.continent); })
          .on('mouseover', myTip.show)
          .on('mouseout', myTip.hide)
          .merge(circles)
          .transition(t)
              .attr('cy', (d) => { return yScale(d.life_exp); })
              .attr('cx', (d) => { return xScale(d.income); })
              .attr('r', (d) => { return Math.sqrt(area(d.population) / Math.PI); });
  
      timeLabel.text(+(time + 1800));
  
    }
  

  