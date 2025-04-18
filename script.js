const API_TOKEN = "sk_prod_sdt7cgBLDa97lnpv9T9eRIzwEeg8DqNzEgQXSdOCZhUnfki9BHUHTXnGA2qUYcV5YJymkfDeFl0UpjHh4fm9ZDWuJanKcp7XLqq_21281";
const formCode = "8og31yYrENus";
const url = `https://api.fillout.com/v1/api/forms/${formCode}/submissions?includePreview=true`;
const headers = {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${API_TOKEN}`
};

let chart;
const colorMap = {};

const primaryColors = [
    'rgba(255, 99, 132, 0.6)',   // red
    'rgba(255, 159, 64, 0.6)',   // orange
    'rgba(255, 206, 86, 0.6)',   // yellow
    'rgba(75, 192, 192, 0.6)',   // teal
    'rgba(54, 162, 235, 0.6)',   // blue
    'rgba(153, 102, 255, 0.6)'   // purple
];

function getColorForLabel(label, index) {
    if (!colorMap[label]) {
        colorMap[label] = primaryColors[index % primaryColors.length];
    }
    return colorMap[label];
}


/**
 * Fethces the latest votes from the Fillout API.
 * 
 * also updates the chart each time its called.
 * @returns {Object}  {label:votes}
 */
async function fetchSubmissions() {
    let vote_count = {};

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            console.error("Something went wrong in the request:", response.status);
            return;
        }

        const data = await response.json();

        vote_count = extract_votes(data)

        console.log(vote_count)
        updateChart(vote_count);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

function extract_votes(data){
    let vote_count = {};
    for (let i = 0; i < data.totalResponses; i++) {
        let votes = data.responses[i].questions[0].value;
        for (let j = 0; j < votes.length; j++) {
            let project_name = votes[j];
            vote_count[project_name] = (vote_count[project_name] || 0) + 1;
        }
    };
    return vote_count;
}

function get_optoins(Horizontal){
    let axies;
    let temp_option = {};

    let y_options = {
        grid: {
            display: false
        }
    }

    let x_options = {
        beginAtZero: true,
        grid: {
            drawTicks: true,
            color: (ctx) => ctx.index % 2 === 0 ? 'rgba(200,200,200,0.2)' : 'transparent'
        }
    }

    if (Horizontal) { 
        axies = 'y'
    }
    else {
        axies = 'x'
        temp_option = y_options;
        y_options = x_options
        x_options = temp_option;
    }

    return {
        indexAxis: axies,
        responsive: true,
        animation: {
            duration: 1000,
            easing: 'easeInOutCubic'
        },
        scales: {
            x: x_options,
            y: y_options
        }
    }
}

function updateChart(vote_count) {
    const sortedEntries = Object.entries(vote_count).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(entry => entry[0]);
    const values = sortedEntries.map(entry => entry[1]);
    const backgroundColors = labels.map((label, index) => getColorForLabel(label, index));

    if (!chart) {
        const ctx = document.getElementById('myChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votes',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: 'rgba(0,0,0,0.2)',
                    borderWidth: 1
                }]
            },
            options: get_optoins(false)
        });
    } else {
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.data.datasets[0].backgroundColor = backgroundColors;
        chart.update();
    }
}

fetchSubmissions();
setInterval(() => fetchSubmissions(), 3000);