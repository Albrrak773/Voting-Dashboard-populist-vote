import os
import requests
import json
import random
import time

# your endpoints & auth
FORM_URL    = "https://api.fillout.com/v1/api/forms/mexUmH9LA8us"
SUBMIT_URL  = FORM_URL + "/submissions"
HEADERS     = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_prod_yztOc8RHXUP2N6EaTMABg3kHLu4RzLCgemnkndDXdp3horj0GCNVYfjZNaSVLNqUvICSdk8frpMChaQQaAAyNZ24oAmizQwGH8k_22186'
}
VOTE_COUNT_FILE = "vote_count.json"
RESPONSES_FILE  = "responses.json"


def main():
    # 1) pull labels once
    all_projects = fetch_labels()

    # 2) load or init your vote counts
    vote_counts = load_vote_counts(all_projects)

    while True:
        # 3) pick and update counts
        picks = choose_random_values(all_projects)
        for p in picks:
            vote_counts[p] += 1
        save_vote_counts(vote_counts)

        # 4) send the request
        payload = build_payload(picks)
        resp = requests.post(
            SUBMIT_URL,
            headers=HEADERS,
            data=json.dumps(payload, ensure_ascii=False)
        )

        # 5) log response
        try:
            result = resp.json()
        except ValueError:
            result = {"error": "invalid JSON", "text": resp.text}

        with open(RESPONSES_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=4)
            f.write("\n")

        print(f"[{time.strftime('%H:%M:%S')}] sent {picks} → status {resp.status_code}")
        time.sleep(5)

def fetch_labels():
    """Fetch every option label from the form, return as a list."""
    resp = requests.get(FORM_URL, headers=HEADERS)
    resp.raise_for_status()
    data = resp.json()
    return [
        opt["label"]
        for q in data.get("questions", [])
        for opt in q.get("options", [])
    ]

def load_vote_counts(labels):
    """
    Load existing counts from VOTE_COUNT_FILE if present,
    else initialize all labels to 0. Ensure any new labels
    get added with 0.
    """
    if os.path.exists(VOTE_COUNT_FILE):
        with open(VOTE_COUNT_FILE, "r", encoding="utf-8") as f:
            counts = json.load(f)
    else:
        counts = {}

    # make sure every label has an entry
    for lbl in labels:
        counts.setdefault(lbl, 0)
    return counts

def save_vote_counts(counts):
    """Overwrite VOTE_COUNT_FILE with the latest counts."""
    with open(VOTE_COUNT_FILE, "w", encoding="utf-8") as f:
        json.dump(counts, f, ensure_ascii=False, indent=2)

def choose_random_values(options_list):
    """Pick 3 unique items at random."""
    return random.sample(options_list, 3)

def build_payload(selected_values):
    """Wrap your picks in the Fillout API payload."""
    return {
        "submissions": [
            {
                "questions": [
                    {
                        "id": "i52M",
                        "name": "صوّت ل3 مشاريع",
                        "type": "ImagePicker",
                        "value": selected_values
                    }
                ]
            }
        ]
    }

if __name__ == "__main__":
    main()
