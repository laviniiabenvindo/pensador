const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const fileStore = require("session-file-store")(session);
const flash = require("express-flash");

const port = 5000;

const app = express();

const conn = require("./db/conn");

// import models
const User = require("./models/User");
const Tought = require("./models/Tought");

// import rotas
const toughtsRoutes = require("./routes/toughtsRoutes");
const authRouters = require("./routes/authRouters");

// import controller
const ToughtController = require("./controllers/ToughtController");
// configurar engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// configurar json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// middleware para sessões
app.use(
  session({
    name: "session",
    secret: "nosso_secret", //Quanto maior a cryoto melhor
    resave: false,
    saveUninitialized: false,
    store: new fileStore({
      logFn: function () {},
      path: require("path").join(require("os").tmpdir(), "sessions"),
    }),
    cookie: {
      secure: false,
      maxAge: 360000,
      expires: new Date(Date.now() + 360000),
      httpOnly: true,
    },
  })
);
// importar as flash
app.use(flash());

// importar os arquivos static
app.use(express.static("public"));

// Armazenar as sessões nas rotas
app.use((request, response, next) => {
  if (request.session.userId) {
    response.locals.session = request.session;
  }
  next();
});

// rotas
app.use("/toughts", toughtsRoutes);
app.use("/", authRouters);
app.get("/", ToughtController.showToughts);
// conexões e criaçãos das tabelas do banco
conn
  .sync()
  .then(() => {
    app.listen(port);
  })
  .catch((err) => console.log(err));
