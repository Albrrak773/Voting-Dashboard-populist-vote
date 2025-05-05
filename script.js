// -------------  CONFIG  -------------
rowNum = document.querySelector("#rowNum")
const FORM_KEY      = '8og31yYrENus';
const AUTH_TOKEN    = 'sk_prod_lSdgmzDTw61d950dImiQini6FMyCgrgRuJ3HZoEdCWN2Y4Ew8x7Is7n4MKamtPp2fmo1xP5DgelUxQicZU05rjnzq24S1Nohg2i_21281';
const BASE_URL      = `https://api.fillout.com/v1/api/forms/${FORM_KEY}`;
const LIMIT         = 150;          // max page size per Fillout docs

// -------------  GLOBALS  ------------- 
let tally      = {};   // { "[1] …": 0, "[2] …": 0, … }
let offset     = 0;    // where we are in the submission list
rowNum.textContent = offset
let timer; 
let seen    = new Set(); 
let counter = 0


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
//============================================================================


// build zero‑filled object once
async function initTally() {
    const res  = await fetch(BASE_URL, { headers:{Authorization:`Bearer ${AUTH_TOKEN}`}});
    const form = await res.json();
    form.questions[0].options          // first question is the project list
        .filter(o => /^\[\d+]/.test(o.value))
        .forEach(o => { tally[o.value] = 0; });
    console.log('Initial tally:', tally);
  }
  
  // page through *all* submissions each run
  async function fetchSubmissions() {
    let got;
    do {
        counter++;
        rowNum.textContent = offset
        console.log(`Offset : {${offset}}`);
        
        const url = `${BASE_URL}/submissions?limit=${LIMIT}&offset=${offset}`;
        const res = await fetch(url, { headers:{Authorization:`Bearer ${AUTH_TOKEN}`}});
        const { responses } = await res.json();
        got = responses.length;
    
        responses.forEach(r => {
            if (seen.has(r.submissionId)) return;          // skip duplicates
            seen.add(r.submissionId);
    
            const choice = r.questions[0]?.value;          // first answer = vote
            if (tally.hasOwnProperty(choice)) tally[choice]++;  
      });
  
      offset += got;                                  // next page
    } while (got === LIMIT);                          // keep paging until last page
  
    offset = 0;                                       // reset for next cycle
    console.log('Current tally:', tally);
    updateChart?.(tally);                             // your callback if needed
  }
  
  // ---------- forever loop ----------
  (async () => {
    await initTally();            // print zeros once
  
    // simple forever‑poll
    (async function loop() {
      await fetchSubmissions();   // scan everything
      setTimeout(loop, 1000);     // wait 1 s then do it again
    })();
  })();

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
    if (project_name.length > 32) {
        project_name = project_name.slice(0, 32) + "..."
    }
    return project_name
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
