const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const PORT = 8000

const app = express()
app.use(express.json())
app.use(cors())

app.listen(PORT, ()=>{
    console.log(`Sweet Resumes listening on port: ${PORT}`)
})


const dbResumes = new sqlite3.Database('Resumes.db', (err) =>{
    if(err){
        console.log("Error opening database:", err.message)
    }
    else{
        console.log("Connected to Resumes.db")
    }
})
//get the types of ingredients
app.get("/api/types", (req, res )=>{
    const strQuery = "SELECT * FROM tblTypes"
    dbResumes.all(strQuery, [], (err, rows) =>{
        if(err){
            return res.status(500).json({ outcome:"error", message: err.message})
        }
        else{
            res.status(200).json({ outcome:"success", message: rows})
        }
    })
})



app.post("/api/", (req, res) =>{

})


