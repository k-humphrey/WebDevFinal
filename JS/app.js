const views = {
  home: document.getElementById("view-home"),
  builder: document.getElementById("view-builder"),
  viewer: document.getElementById("view-viewer"),
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[name].classList.remove("hidden");
}

// Nav buttons
document.getElementById("btnHome").onclick = () => showView("home");
document.getElementById("btnBuilder").onclick = () => showView("builder");
document.getElementById("btnViewer").onclick = () => showView("viewer");
document.getElementById("btnStart").onclick = () => showView("builder");