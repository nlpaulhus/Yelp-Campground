const Campground = require('../models/campground');
const Review = require('../models/review')

module.exports.post = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const { rating, body } = req.body;
    const author = req.user._id;
    const review = new Review({
        rating: rating,
        body: body,
        author: author
    })
    await campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Your review was created!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.edit = async (req, res, next) => {
    const review = await Review.findById(req.params.reviewid);
    const campground = await Campground.findById(req.params.id);
    res.render('reviews/edit', { review, campground })
}

module.exports.deletes = async (req, res, next) => {
    const { id, reviewid } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: { reviewid } } })
    await Review.findByIdAndDelete(reviewid);
    req.flash('success', 'Your review was deleted!');
    return res.redirect(`/campgrounds/${id}`)
}
