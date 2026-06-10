const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/asyncCatch');
const ExpressError = require('../utilities/expressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.post));

router.delete('/:reviewid', isLoggedIn, isReviewAuthor, catchAsync(reviews.deletes));

module.exports = router;