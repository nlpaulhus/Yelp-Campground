const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
};

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: "https://res.cloudinary.com/paul-house-productions/image/upload/v1649182688/YelpCamp/o6dclru3zjdkxdoa17vm.jpg",
                    filename: "YelpCamp/o6dclru3zjdkxdoa17vm"
                },
                {
                    url: "https://res.cloudinary.com/paul-house-productions/image/upload/v1649182688/YelpCamp/czm4sapar0kljfliaw3k.jpg",
                    filename: "YelpCamp/czm4sapar0kljfliaw3k"
                },
                {
                    url: "https://res.cloudinary.com/paul-house-productions/image/upload/v1649182688/YelpCamp/dbjy0bnjylikxnc6lqxk.jpg",
                    filename: "YelpCamp/dbjy0bnjylikxnc6lqxk"
                }],
            price: price,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            city: `${cities[random1000].city}`,
            state: `${cities[random1000].state}`,
            geometry: {
                type: 'Point', coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            author: '62511918ad556c23cac52131'
        });
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})