

const API_TOKEN = "sk_prod_sdt7cgBLDa97lnpv9T9eRIzwEeg8DqNzEgQXSdOCZhUnfki9BHUHTXnGA2qUYcV5YJymkfDeFl0UpjHh4fm9ZDWuJanKcp7XLqq_21281";
const formCode = "8og31yYrENus";
const url = `https://api.fillout.com/v1/api/forms/${formCode}/submissions?includePreview=true`;

const headers = {
  "Authorization": `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json"
};

async function fetchSubmissions() {

    vote_count = {}

    let response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      console.error("Something went wrong in the request:", response.status);
      return;
    }

    let data = await response.json();
    
    for (let i = 0; i < data.totalResponses; i++) {
        let votes = data.responses[i].questions[0].value
        for (let j = 0; j < votes.length; j++) {
            project_name = votes[j];
            if (!(project_name in vote_count)) {
                vote_count[project_name] = 1
            }
            else{
                vote_count[project_name] += 1
            }
            
        }
        console.log(votes)
    }
    console.log(vote_count)
    
    console.log(data)
    return vote_count;
}


setInterval(fetchSubmissions, 3000);
console.log("OUTSIDE: ", fetchSubmissions())
const data = {
  Red: 12,
  Blue: 19,
  Yellow: 3,
  Green: 5
};

// Extract labels and values from the object
const labels = Object.keys(data);
const values = Object.values(data);

const ctx = document.getElementById('myChart').getContext('2d');

const myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      label: 'Votes',
      data: values,
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)'
      ],
      borderColor: 'rgba(0,0,0,0.2)',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});