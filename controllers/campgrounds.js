const campground = require('../models/campground');
const Campground = require('../models/campground');
const { cloudinary, storage } = require('../cloudinaryconfig');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const review = require('../models/review');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({}).populate('reviews');
    res.render('campgrounds/index', { campgrounds })
}

module.exports.new = (req, res) => {
    res.render('campgrounds/new', { states })
}

module.exports.show = async (req, res) => {
    const campground = await (await Campground.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } }).populate('author'));
    if (!campground) {
        req.flash('error', 'Cannot find that campground.');
        return res.redirect('/campgrounds')
    }
    console.log(campground.geometry.coordinates)
    res.render('campgrounds/show', { campground })
}

module.exports.edit = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground.');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground, states })
}

module.exports.post = async (req, res, next) => {
    const { title, city, state, price, description } = req.body;
    const geoData = await geocoder.forwardGeocode({
        query: `${city}, ${state}`,
        limit: 1
    }).send()
    const newCampground = new Campground({
        title: title,
        city: city,
        state: state,
        geometry: geoData.body.features[0].geometry,
        images: req.files.map(f => ({ url: f.path, filename: f.filename })),
        price: price,
        description: description,
        author: req.user._id
    });
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', 'Your campground was created!')
    res.redirect('/campgrounds')
}

module.exports.patch = async (req, res, next) => {
    console.log(req.body)
    const { title, city, state, price, description } = req.body
    const { id } = req.params
    const editedCampground = {
        title: title,
        city: city,
        state: state,
        price: price,
        description: description
    }
    const cmpground = await Campground.findByIdAndUpdate(id, { editedCampground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    cmpground.images.push(...imgs);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await cmpground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await cmpground.save();
    req.flash('success', 'Your campground was edited!');
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.delete = async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Your campground was deleted!')
    res.redirect('/campgrounds')
}