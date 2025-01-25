require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000
const db = require('./db')
const models = require('./models/models')
const cors = require('cors')
const router = require('./routes/index')
const errorHandler = require('./middlewares/ErrorHandlingMiddleware')


const corsOptions = {
    origin:'http://localhost:8081',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}


app.use(express.json())
app.use(cors(corsOptions))
app.use('/api', router)


app.use(errorHandler)
const server = require('http').createServer(app)

const start = async () => {
    try {
        await db.authenticate()
        await db.sync({alter:true})

        server.listen(PORT, () => {
            console.log('Server start on port ' + PORT)
        })
    } catch (e) {
        console.log(e)
    }
}

start()