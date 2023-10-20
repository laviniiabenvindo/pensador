const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')//Criar sessão do usuário
const Filestore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const conn = require('./db/conn')

//Models
const User = require('./models/User')
const Tought = require('./models/Tought')

//IMPORTAR AS ROTAS
const toughtsRouters = require('./routes/toughtsRouters')
const authRouters = require('./routes/authRoutes')

//IMPORTAR CONTROLADOR RESPONSÁVEL PELA HOME
const ToughtController = require('./controllers/ToughtController')

//Import Engine
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

//Import JSON
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//Import middleware para controle de sessões
app.use(session({
  name:"session",
  secret:"nosso_segredo",
  resave: false,
  saveUninitialized: false,
  store: new Filestore({
    logFn: function() {},
    path: require('path').join(require('os').tmpdir(), 'sessions')
  }),
  cookie:{
    secure: false,
    maxAge: 360000,
    expires: new Date(Date.now() + 360000),
    httpOnly: true
  }
}))

//Import as flash Messages
app.use(flash())

//Import static files
app.use(express.static('public'))

//Middleware para armazenar sessões na resposta
app.use((request, response, next)=>{
  if(request.session.userId){
    response.locals.session = request.session
  }
  next()
})

//ROTAS
app.use('/toughts', toughtsRouters)
app.use('/', authRouters)

app.get('/', ToughtController.showToughts)

conn
  // .sync({force:true})
  .sync()
  .then(()=>{
    app.listen(3333)
  })
  .catch((err)=>console.log(err))
