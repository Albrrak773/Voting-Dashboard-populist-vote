const API_TOKEN = "sk_prod_yztOc8RHXUP2N6EaTMABg3kHLu4RzLCgemnkndDXdp3horj0GCNVYfjZNaSVLNqUvICSdk8frpMChaQQaAAyNZ24oAmizQwGH8k_22186";

const isBoys = true;
const initializer_value = 0

if (isBoys) {
    var formCode = "mexUmH9LA8us";
} else {
    var formCode = "wbjvtoxwHPus"
}

const submissions_url = `https://api.fillout.com/v1/api/forms/${formCode}/submissions?includePreview=true`;
const questions_url = `https://api.fillout.com/v1/api/forms/${formCode}`



const headers = {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${API_TOKEN}`
};
let chart;
const colorMap = {};

// async function intilaize_votes(){
// };

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

async function get_fake_data(){
    return fetch('Mock_Data.json')
    .then(response => response.json())
};

function shorten_name(project_name){
    console.log("len: ", project_name.length);
    if (project_name.length > 32) {
        project_name = project_name.slice(0, 32) + "..."
    }
    console.log("len after: ", project_name);
    return project_name
}

function extract_votes(data, vote_count){
    for (let i = 0; i < data.totalResponses; i++) {
        let votes = data.responses[i].questions[0].value;
        for (let j = 0; j < votes.length; j++) {
            let project_name = shorten_name(votes[j]);
            vote_count[project_name] = (vote_count[project_name] || 0) + 1;
        }
    };
    return vote_count;
};

/**
 * Fethces the latest votes from the Fillout API.
 * 
 * also updates the chart each time its called.
 * @returns {Object}  {label:votes}
 */
async function fetchSubmissions() {

    // Get all Questions Names and intitlize them with 1
    let vote_count = {}
    console.log("Intilaizing Votes....");
    const response = await fetch(questions_url, {
        method: 'GET',
        headers: headers
    });

    const data = await response.json();
    data.questions[0].options.forEach(element => {
        let name = shorten_name(element.value)
        vote_count[name] = initializer_value
    });
    console.log("VOTES FIRST TIME: ", vote_count);

    try {
        const response = await fetch(submissions_url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            console.error("Something went wrong in the request:", response.status);
            return;
        }

        const data = await response.json();

        vote_count = extract_votes(data, vote_count)
        // vote_count = await get_fake_data(); // Needs to be removed
        // vote_count = vote_count['set1'] // Needs to be removed
        console.log("Votes: ", vote_count)
        updateChart(vote_count);
    } catch (err) {
        console.error("Fetch error:", err);
    }

    return vote_count
}


function get_options(){
    return {
        indexAxis: 'y',
        responsive: true,
        animation: {
            duration: 1000,
            easing: 'easeInOutCubic'
        },
        layout: {
            padding: {
                right: 30
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 16,
                        family: 'Arial'
                    },
                    color: '#000',
                    display: false
                },
                grid: {
                    drawTicks: true,
                    color: (ctx) => ctx.index % 2 === 0 ? 'rgba(200,200,200,0.2)' : 'transparent'
                }
            },
            y: {
                ticks: {
                    font: {
                        size: 16,
                        family: 'Arial'
                    },
                    color: '#000'
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
              display: false
            },
            title: {
                display: true,
                text: 'اصوات مشاريع التخرج',
                font: {
                    size: 40,
                    family: 'Cairo',
                    weight: '400'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            datalabels: {
                color: '#000',
                anchor: 'end',
                align: 'right',
                offset: 4,
                font: {
                    weight: 'normal',
                    size: 14
                },
                formatter: value => value
            }
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
            
            plugins: [ChartDataLabels],
            options: get_options()
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