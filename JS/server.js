
let landingPage = document.getElementById('divLandingPage')
let startButton = document.getElementById('btnStart')
let builderPage = document.getElementById('divResumeBuilder')
let viewerPage = document.getElementById('divResumeViewer')
let homeButton = document.getElementById('btnHome')
let makerButton = document.getElementById('btnMaker')
let viewerButton = document.getElementById('btnViewer')
let navbarDropdown = document.getElementById('navbar-user')

document.addEventListener('DOMContentLoaded', ()=>{
    //start button goes to resume builder page (only starts in landing page)
    startButton.addEventListener('click', ()=>{
        landingPage.classList.add('hidden')
        navbarDropdown.classList.add('hidden')
        builderPage.classList.remove('hidden')
    })

    //home button goes to landing page
    homeButton.addEventListener('click', ()=>{
        builderPage.classList.add('hidden')
        viewerPage.classList.add('hidden')
        navbarDropdown.classList.add('hidden')
        landingPage.classList.remove('hidden')
    })

    //resume maker button goes to resume maker page
    makerButton.addEventListener('click', ()=>{
        viewerPage.classList.add('hidden')
        landingPage.classList.add('hidden')
        navbarDropdown.classList.add('hidden')
        builderPage.classList.remove('hidden')
    })

    //resume viewer button goes to resume viewer page
    viewerButton.addEventListener('click', ()=>{
        landingPage.classList.add('hidden')
        builderPage.classList.add('hidden')
        navbarDropdown.classList.add('hidden')
        viewerPage.classList.remove('hidden')
    })

    
})


