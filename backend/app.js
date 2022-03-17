const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const authJwt = require('./helpers/jwt')
const { errorHandler } = require('./helpers/error-handler')
require('dotenv/config')

app.use(cors())
app.options('*', cors())

//middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)

//routes
const categoriesRouter = require('./routers/categories')
const productsRouter = require('./routers/products')
const ordersRouter = require('./routers/orders')
const usersRouter = require('./routers/users')

const api = process.env.API_URL

app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/products`, productsRouter)
app.use(`${api}/users`, usersRouter)
app.use(`${api}/orders`, ordersRouter)

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected with MongoDb')
    })
    .catch((err) => {
        console.log(err)
    })

app.listen(3000, () => {
    console.log('Server started at port 3000')
})
