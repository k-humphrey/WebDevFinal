const API = "http://localhost:3000/api";

export async function saveResume(data) {
  const res = await fetch(`${API}/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function getAISuggestions(text) {
  const res = await fetch(`${API}/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  return res.json();
}