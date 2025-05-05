const API_TOKEN = "sk_prod_lSdgmzDTw61d950dImiQini6FMyCgrgRuJ3HZoEdCWN2Y4Ew8x7Is7n4MKamtPp2fmo1xP5DgelUxQicZU05rjnzq24S1Nohg2i_21281";
const isBoys = true;
const initializer_value = 0
var is_fetching = true
var formCode = "8og31yYrENus";
const submissions_url = `https://api.fillout.com/v1/api/forms/${formCode}/submissions?includePreview=true&limit=150`;
const questions_url = `https://api.fillout.com/v1/api/forms/${formCode}`
const headers = {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${API_TOKEN}`
};
//============================================================================




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
    console.log("SHORTEN NAME GOT: ", project_name);
    
    if (project_name.length > 32) {
        project_name = project_name.slice(0, 32) + "..."
    }
    return project_name
}

function count_votes(responses, vote_count){
    for (let i = 0; i < responses.length; i++) {
        let raw  = responses[i].questions[0].value;
        let list = raw
          .split(/\s*,\s*/)            // split on commas
          .map(s => s.replace(/^\[|\]$/g, ""));  // strip brackets
        
        for (let project_name of list) {
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
    is_fetching = false
    // 1) build template for vote_count
    let count = 0;
    let vote_count = {};
    console.log("Initializing vote_count template…");
    const qRes  = await fetch(questions_url, { method: 'GET', headers });
    const qData = await qRes.json();

    qData.questions[0].options.forEach(opt => {
        vote_count[shorten_name(opt.value)] = initializer_value;
    });
    console.log("Intial Lables: ", vote_count);
  
    try {
      // 2) page through ALL submissions by response-count
      const allResponses = [];
      let offset   = 0;
      let pageSize = Infinity;
  
      while (true) {
        count++;
        console.log(`Making Request [${count}]`);
        
        const pageUrl = `${submissions_url}&offset=${offset}`;
        const res     = await fetch(pageUrl, { method: 'GET', headers });
        if (!res.ok) {
          console.error("Failed to fetch submissions:", res.status);
          break;
        }
        console.log(`Status: [${res.status}]`);
  
        const page = await res.json();
        const responses = page.responses;
  
        // record how many come back on page #1
        if (offset === 0) pageSize = responses.length;
  
        // nothing more? bail out
        if (responses.length === 0) break;
  
        // accumulate
        allResponses.push(...responses);
  
        // if this page came back smaller than “full”, we hit the end
        if (responses.length < pageSize) break;
  
        // otherwise bump offset and fetch the next chunk
        offset += responses.length;
      }

      vote_count = count_votes(allResponses, vote_count);
      console.log("Tally from all pages:", vote_count);
      updateChart(vote_count);
  
    } catch (err) {
      console.error("Fetch error:", err);
    }
    is_fetching = true
    return vote_count;
  }

function get_options(){
    return {
        devicePixelRatio: 2,
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
                    color: '#F4F7F5'
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
                color: '#F4F7F5',
                text: 'اصوات مشاريع التخرج',
                font: {
                    size: 40,
                    family: 'Tajawal',
                    weight: '500'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            datalabels: {
                color: '#F4F7F5',
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
    const canvas = document.getElementById('myChart');
    
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
var wait_counter = 0;
setInterval(() => {
    if (is_fetching){
        wait_counter = 0;
        fetchSubmissions()
    }
    else {
        wait_counter++;
        console.log(`WAITING....${wait_counter}`);
        return
    }


}, 1000);
