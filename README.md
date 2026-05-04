# WebDevFinal
My Final for webdev.

My docs:
https://v3.tailwindcss.com/docs/installation
https://flowbite.com/docs/getting-started/quickstart/

My notes:
npx tailwindcss -i input.css -o output.css --watch

My use of AI:
I did not use AI in the beginning and I wish that I had. I actually worked on this for a long time, but the long time was more due to OCD than actual progress.
I used codex in the end because I had never practiced that in class (oops). I then read through everything and could understand how it mangled the original application into something,, vaguely similar. Below I shared all of my prompts.

Sharing with others:
I wouldn't reccommend sharing with others, as it is maybe an example of what not to do. 


Chatgpt prompts: 
- I am building an application that will construct resumes out of components (an added experience, education, skill, etc. object) and I want to generalize the structure of a resume for my sqlite data base. can you give me and example of a resume in json format that is general enough to account for different types of applications such as technical, creative, etc?

- I am creating a website that builds resumes. The big things that I need to do are 1. authenticate users, 2. integrate ai and 3. build resumes that can be exported and used. I have a very rough draft of this already, but I want the process to go by faster. I have used tailwind, flowbite, and use npm (no cdns) to manage packages. I have an sqlite database that holds the user information and resumes, components of resumes, and selected components that can be used to build new resumes. I want to use codex to make this possible. Please write me an agents.md file for it.

- Great, now can you generate a prompt for codex that ensures quality work and something that I can debug in the end? This can also be a series of prompts and checkpoints for debugging. 


Codex prompts:
You are a senior full-stack engineer working on a resume builder web app.

Tech stack:
- Node.js + Express
- SQLite
- Tailwind CSS + Flowbite
- npm (no CDN usage)

Core requirements:
1. User authentication
2. AI-generated resume content
3. Resume builder with export (PDF minimum)

Your priorities:
- Write clean, modular, testable code
- Use consistent folder structure
- Add comments explaining non-obvious logic
- Avoid large monolithic files
- Validate inputs and handle errors explicitly
- Do not skip edge cases

For every feature:
1. Explain the plan briefly
2. Implement in small steps
3. Show file structure changes
4. Include test or debug instructions

When something could break:
- Add logging
- Add validation
- Suggest how to test it manually

Do NOT:
- Invent dependencies without explaining why
- Skip database schema updates
- Write placeholder code without marking it clearly

Always end with:
- “How to test this”
- “Common failure points”


- The skills type should not display title, organization, location, start date or end date. It is essentially a list of skills. In addition to this, Quilljs should be used to support rich text editing.

-In addition to that,  I want to be able to select and deselect the components to be used in my resumes. Being able to delete components is necessary. Also, making the cards scrollable will keep the page from feeling too big.