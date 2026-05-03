import { saveResume, getAISuggestions } from "./api.js";

const preview = document.getElementById("resumePreview");

document.getElementById("btnSave").onclick = async () => {
  const data = collectForm();
  await saveResume(data);
  renderPreview(data);
};

document.getElementById("btnAI").onclick = async () => {
  const text = document.getElementById("jobDesc").value;
  const result = await getAISuggestions(text);
  document.getElementById("jobDesc").value = result.suggestion;
};

function collectForm() {
  return {
    firstName: fname.value,
    lastName: lname.value,
    jobTitle: jobTitle.value,
    description: jobDesc.value
  };
}

function renderPreview(data) {
  preview.innerHTML = `
    <h1>${data.firstName} ${data.lastName}</h1>
    <h2>${data.jobTitle}</h2>
    <p>${data.description}</p>
  `;
}