const path = require('path');
const Koa = require('koa')
const views = require('koa-views')
const serve = require('koa-static')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

app.use(views(path.join(process.cwd(), '/views'), {extension: 'ejs'}))
app.use(serve(path.join(process.cwd())))

router.get('/', async(ctx, next) => {
	await ctx.render('index')
})

// cors的简单请求
router.get('/cors', (ctx, next) => {
	console.log('simple request')
	ctx.set('Access-Control-Allow-Origin', '*')
	ctx.body = '123321'
})

//cors的主请求
router.post('/cors', (ctx, next) => {
	console.log('cors main request', ctx.header)
	ctx.body = 'I am the worm'
})

// cors主请求的预请求
router.options('/cors', (ctx, next) => {
	console.log('cors pre-request')
	ctx.set('Access-Control-Allow-Origin', '*')
	ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
	ctx.set('Access-Control-Allow-Headers', 'X-PINGOTHER, content-type')
	ctx.set('Access-Control-Max-Age', '1')
	ctx.set('Content-Length', '0')
	ctx.set('Content-Type', 'application/xml')
	ctx.set('Access-Control-Allow-Credentials', 'true')
	ctx.body = ''
})

router.get('/jsonp', (ctx, next) => {
	console.log('jsonp')
	ctx.body = 'fn({"a":1})'
})

router.get('*', async(ctx, next) => {
	await ctx.render('index')
})

app.use(router.routes())
	.use(router.allowedMethods())

app.listen(3000)