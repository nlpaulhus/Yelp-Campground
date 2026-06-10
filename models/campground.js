const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    city: String,
    state: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<h5><a href='/campgrounds/${this._id}'>${this.title}</a></h5>`
});

CampgroundSchema.virtual('avgRating').get(function () {
    const ratings = [];
    for (let review of this.reviews) {
        ratings.push(review.rating)
    };
    const total = ratings.reduce((partialSum, a) => partialSum + a, 0);
    const numOfReviews = this.reviews.length;
    return Math.floor(total / numOfReviews);
})

const avgRating = (campground) => {
    const ratings = [];
    for (let review of campground.reviews) {
        ratings.push(review.rating)
    }
    return (ratings.reduce((partialSum, a) => partialSum + a, 0)) / campground.reviews.length;
}

CampgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema);