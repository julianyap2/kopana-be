var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const methodOverride = require("method-override");
const session = require("express-session");
const cors = require("cors");

const { join } = require("path");
const { UserRoleModel } = require("./models/UserRole");
const { default: UserModel } = require("./models/Users");

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
      origin: 'http://localhost:3001',
      credentials: true
    }));

    // view engine setup
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");
    app.use(methodOverride("_method"));

    const oneday = 1000 * 60 * 60 * 24;
    app.use(
      session({
        name: 'kopana',
        secret: "julian:app",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: oneday },
      }),
      async (req, res, next) => {
        if (req.session.user) {
          req.user = req.session.user;
          const { roles } = await UserModel.findById(req.user._id)
            .populate('roles')
            .exec();
          req.user.roles = roles;
        }
        next();
      }
    );
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
  const User = { name: 'user' };

  let adminRole = await UserRoleModel.findOne(Admin).exec();
  if (!adminRole) {
    adminRole = await (await UserRoleModel.create(Admin)).save();
  }

  let userRole = await UserRoleModel.findOne(User).exec();
  if (!userRole) {
    userRole = await (await UserRoleModel.create(User)).save();
  }

  let userAdmin = await UserModel.findOne({ email: 'admin@admin.com' });
  // if(userAdmin) userAdmin.delete();
  if (!userAdmin) {
    await (await UserModel.create({
      nama: 'admin',
      password: require('bcryptjs').hashSync('admin', 12),
      email: 'admin@admin.com',
      noPegawaiPertamina: 'aahusvdf8ub293u',
      roles: [userRole._id, adminRole._id]
    })).save()
  }

}