

const API_TOKEN = "sk_prod_sdt7cgBLDa97lnpv9T9eRIzwEeg8DqNzEgQXSdOCZhUnfki9BHUHTXnGA2qUYcV5YJymkfDeFl0UpjHh4fm9ZDWuJanKcp7XLqq_21281";
const formCode = "8og31yYrENus";
const url = `https://api.fillout.com/v1/api/forms/${formCode}/submissions?includePreview=true`;

const headers = {
  "Authorization": `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json"
};

async function fetchSubmissions() {

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
        console.log(votes)
    }
    
    console.log(data); 

}


setInterval(fetchSubmissions, 3000);
