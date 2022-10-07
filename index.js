var width = 800,
    height = 400,
    barWidth = width / 275;

var ttip = d3
    .select('.visHolder')
    .append('div')
    .attr('id', 'ttip')
    .style('opacity', 0);

var overlay = d3
    .select('.visHolder')
    .append('div')
    .attr('class', 'overlay')
    .style('opacity', 0);

var svgContainer = d3
    .select('.visHolder')
    .append('svg')
    .attr('width', width + 100)
    .attr('height', height + 100);

d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')
    .then(data => {

        // Adding a title
        document.getElementById("title").innerHTML = data.source_name;

        // Adding a data source
        svgContainer
            .append('text')
            .style('fill', 'blue')
            .attr('x', width / 3.5)
            .attr('y', height + 90)
            .attr('class', 'info')
            .text('Source: https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')

        // Adding a label on Y-axis
        svgContainer
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -200)
            .attr('y', 80)
            .text('Gross Domestic Product');

        // Adding a label on X-axis
        svgContainer
            .append('text')
            .attr('x', width / 2)
            .attr('y', height + 50)
            .text('Years');

        // Quarter Finder
        var years = data.data.map(function (item) {
            var quarter;
            var temp = item[0].substring(5, 7);

            if (temp === '01') {
                quarter = 'Q1';
            } else if (temp === '04') {
                quarter = 'Q2';
            } else if (temp === '07') {
                quarter = 'Q3';
            } else if (temp === '10') {
                quarter = 'Q4';
            }
            return item[0].substring(0, 4) + ' ' + quarter;
        });

        var yearsDate = data.data.map(function (item) {
            return new Date(item[0]);
        });

        // Adding X-label
        var xMax = new Date(d3.max(yearsDate));
        xMax.setMonth(xMax.getMonth() + 3);
        var xScale = d3
            .scaleTime()
            .domain([d3.min(yearsDate), xMax])
            .range([0, width]);
        var xAxis = d3.axisBottom().scale(xScale);
        svgContainer
            .append('g')
            .call(xAxis)
            .attr('id', 'x-axis')
            .attr('transform', 'translate(60, 410)');

        var GDP = data.data.map(function (item) {
            return item[1];
        });
        var scaledGDP = [];
        var gdpMax = d3.max(GDP);
        var linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, height]);
        scaledGDP = GDP.map(function (item) {
            return linearScale(item);
        });

        // Adding Y-label
        var yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([height, 0]);
        var yAxis = d3.axisLeft(yAxisScale);
        svgContainer
            .append('g')
            .call(yAxis)
            .attr('id', 'y-axis')
            .attr('transform', 'translate(60, 10)');

        d3.select('svg')
            .selectAll('rect')
            .data(scaledGDP)
            .enter()
            .append('rect')
            .attr('data-date', function (d, i) {
                return data.data[i][0];
            })
            .attr('data-gdp', function (d, i) {
                return data.data[i][1];
            })
            .attr('class', 'bar')
            .attr('x', (d, i) => xScale(yearsDate[i]))
            .attr('y', function (d) {
                return height - d + 10;
            })
            .attr('width', barWidth)
            .attr('height', function (d) {
                return d;
            })
            .attr('index', (d, i) => i)
            .style('fill', '#33adff')
            .attr('transform', 'translate(60, 0)')
            .on('mouseover', function (event, d) {
                var i = this.getAttribute('index');
                overlay
                    .transition()
                    .duration(0)
                    .style('height', d + 'px')
                    .style('width', barWidth + 'px')
                    .style('opacity', 0.9)
                    .style('left', i * barWidth + 0 + 'px')
                    .style('top', height - d + 10 + 'px')
                    .style('transform', 'translateX(60px)');
                ttip.transition().duration(200).style('opacity', 0.9);
                ttip
                    .html(
                        years[i] +
                        '<br>' +
                        '$' +
                        GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
                        ' Billion'
                    )
                    .attr('data-date', data.data[i][0])
                    .style('left', i * barWidth + 30 + 'px')
                    .style('top', height - 110 + 'px')
                    .style('transform', 'translateX(60px)');
            })
            .on('mouseout', function () {
                ttip.transition().duration(200).style('opacity', 0);
                overlay.transition().duration(200).style('opacity', 0);
            });
    })
    .catch(e => console.log(e));
