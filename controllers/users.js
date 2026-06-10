const User = require('../models/user');

module.exports.registrationPage = (req, res) => {
    res.render('users/register');
}

module.exports.post = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err)
        })
        req.flash('success', `Welcome to YelpCamp!`);
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
}

module.exports.loginPage = (req, res) => {
    res.render('users/login', { referer: req.headers.referer });
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    if (req.session.returnTo) {
        const redirectUrl = req.session.returnTo
        delete req.session.returnTo
        res.redirect(redirectUrl)
    } else if (req.body.referer && (req.body.referer !== undefined && req.body.referer.slice(-6) !== "/login")) {
        res.redirect(req.body.referer);
    } else {
        res.redirect("/campgrounds");
    }
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
}

