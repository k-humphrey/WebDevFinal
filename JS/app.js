const Quill = window.Quill;

let landingPage = document.getElementById('divLandingPage')
let startButton = document.getElementById('btnStart')
let builderPage = document.getElementById('divResumeBuilder')
let viewerPage = document.getElementById('divResumeViewer')
let homeButton = document.getElementById('btnHome')
let makerButton = document.getElementById('btnMaker')
let viewerButton = document.getElementById('btnViewer')
let navbarDropdown = document.getElementById('navbar-user')
let componentButton = document.getElementById('btnComponentMaker')
let basicsSection = document.getElementById('divBasicsSelections')
let componentSection = document.getElementById('divComponentMaker')
let componentForm = document.getElementById('divIngredient')
let formFieldsdiv = document.getElementById('divFormFields')

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
        basicsSection.classList.remove('hidden')
        componentSection.classList.add('hidden')
    })

    //resume viewer button goes to resume viewer page
    viewerButton.addEventListener('click', ()=>{
        landingPage.classList.add('hidden')
        builderPage.classList.add('hidden')
        navbarDropdown.classList.add('hidden')
        viewerPage.classList.remove('hidden')
    })

    //when next button is pressed,  dynamically show the selected type and then make a listener for that changing display
    componentButton.addEventListener('click', ()=>{
        basicsSection.classList.add('hidden')
        componentSection.classList.remove('hidden')
        componentForm.innerHTML = `<label for="selType">Select Ingredient Type</label>
        <select id="selType" class="select"><option>...</option></select>`

        fetch(`http://localhost:8000/api/types`)
        .then(res => res.json())
        .then(data =>{
            let arrTypes = data.message
            let selectType
            arrTypes.forEach(objOption => {
                selectType = document.getElementById('selType')
                selectType.innerHTML += `
                <option value="${objOption.TypeName}">${objOption.TypeName}</option>
                `
            })
            let strSelection
            selectType.addEventListener('change', (selection) => {
                strSelection = selection.target.value
                const formFields = arrTypes.find(obj => obj.TypeName == strSelection)
                
                if (formFields) {
                    formFieldsdiv.innerHTML = formFields.TypeFields
                    
                    if(strSelection == "Education" || strSelection == "Experience") {
                        new Datepicker(document.getElementById('dateStart'))
                        new Datepicker(document.getElementById('dateEnd'))

                        setTimeout(() => {
                            const editorElement = document.getElementById('txtrelevantCoursework')
                            //Only initialize Quill if the element actually exists on the page
                            if (editorElement) {
                                const quill = new Quill('#txtrelevantCoursework', {
                                    theme: 'snow',
                                    placeholder: 'Give a bulleted list of full sentences',
                                    modules: {
                                        toolbar: [
                                            ['bold', 'italic', 'underline'],
                                            [{ list: 'ordered' }, { list: 'bullet' }],
                                            ['link', 'image']  
                                        ]
                                    }
                                })
                            }
                        }, 50) //delay 50s 
                    } else {
                        
                    }
                }
            })
    })

    
})


})