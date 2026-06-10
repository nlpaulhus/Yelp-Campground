const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/expressError');

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in for that.');
        return res.redirect('/login')
    }
    next();
};

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission for that.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewid } = req.params;
    const review = await Review.findById(reviewid);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission for that.')
        return res.redirect(`/campground/${id}`)
    }
    next()
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next()
    }
}




module.exports = { isLoggedIn, validateCampground, isAuthor, validateReview, isReviewAuthor }