const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/asyncCatch');
const ExpressError = require('../utilities/expressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer')
const { storage } = require('../cloudinaryconfig')
const upload = multer({ storage: storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(campgrounds.post))

router.get('/new', isLoggedIn, campgrounds.new);

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .patch(isLoggedIn, isAuthor, upload.array('images'), catchAsync(campgrounds.patch))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.edit));

module.exports = router;
