if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/expressError');
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const campgroundsRoute = require('./routes/campgrounds');
const reviewsRoute = require('./routes/reviews');
const userRoute = require('./routes/users')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

const app = express();
const path = require('path');
var methodOverride = require('method-override');
const { groupEnd } = require('console');
const { title } = require('process');
const { findById } = require('./models/campground');

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(mongoSanitize());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = ["https://res.cloudinary.com/dv5vm4sqh/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/paul-house-productions/",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
            childSrc: ["blob:"]
        }
    })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    ttl: 7 * 24 * 60 * 60,
    touchAfter: 24 * 3600
});

store.on('error', function (e) {
    console.log('Session error', e)
});

const sessionOptions = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home')
})
app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/reviews', reviewsRoute);
app.use('/', userRoute);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found.', 404));
})
app.use((err, req, res, next) => {
    const { status = 500, message = 'Oops! Something went wrong...' } = err;
    res.status(status);
    res.render('error', { status, message })
})