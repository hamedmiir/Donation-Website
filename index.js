const config = require('config')
const path = require('path')
const Koa = require('koa')
const Router = require('koa-router')
const loadRoutes = require("./app/routes")
const DataLoader = require("./app/dataLoader")
const views = require('koa-views')
const serve = require('koa-static')

const app = new Koa()
const router = new Router()

// Reads json files
const productsLoader = new DataLoader(
    path.join(
        __dirname,
        config.get('data.path'),
        'products')
)

// Views setup
app.use(views(
    path.join(__dirname, config.get('views.path')),
    config.get('views.options')
))

// Static files
app.use(serve(config.get('static.path')))

// Hydrate ctx.state with global settings
app.use(async (ctx, next) => {
    ctx.state.settings = config.get('settings')
    ctx.state.urlWithoutQuery = ctx.origin + ctx.path
    await next()    //pass to next middleware
})

// Config router
loadRoutes(router, productsLoader)
app.use(router.routes())

// Start
const port = process.env.PORT || config.get('server.port')
app.listen(port, () => {
    console.log(`Application is listening on port ${port}`)
})