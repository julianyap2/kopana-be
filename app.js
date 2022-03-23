var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");

const { join } = require("path");
const { UserRoleModel } = require("./models/UserRole");

/**
 * 
 * @param {(e: express.Express) => void} cb 
 */
module.exports = async function Application(cb) {
  require("mongoose").connect("mongodb://localhost:27017/testApi", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    appName: 'kopana'
  }, async function (err) {
    if (err) throw err;

    await createDefaultRoles();
    var app = express();

    app.use(cors({
      origin: '*',
    }));

    // view engine setup
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");
    app.use(methodOverride("_method"));

    const oneday = 1000 * 60 * 60 * 24;
    app.use(
      session({
        secret: "julian:app",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: oneday },
      })
    );
    app.use(flash());
    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser('julian:app'));
    app.use(express.static(path.join(__dirname, "public")));
    app.use('/images', express.static(join(__dirname, 'public', 'images')))
    // app.use('/sb-admin-2', express.static(path.join(__dirname, 'node_modules/startbootstrap-sb-admin-2')));

    // app.use('/', indexRouter);
    // app.use('/users', usersRouter);
    // admin
    // app.use('/admin', adminRouter);
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Method', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Method', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      // res.setHeader('Content-Type', 'application/json; charset=utf-8')
      next();
    });
    app.use("/api/v1", require('./routes/api'));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      console.log('asd')
      next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render("error");
    });

    cb(app);
  });
}

async function createDefaultRoles() {
  const Admin = { name: 'admin' };
  const User = { name: 'admin' };

  const adminRole = await UserRoleModel.findOne(Admin).exec();
  if (!adminRole) {
    await (await UserRoleModel.create(Admin)).save();
  }

  const userRole = await UserRoleModel.findOne(User).exec();
  if (!userRole) {
    await (await UserRoleModel.create(User)).save();
  }
}