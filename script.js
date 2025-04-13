

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
