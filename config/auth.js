module.exports = {
    ensureAuthenticated: (req, res, next) => {
        console.info("inside ensure" + req.session.returnTo);
        if (req.isAuthenticated()) {
            delete req.session.returnTo;
            return next();
        }
        req.session.returnTo = req.originalUrl;
        console.log("RETURN URL="+req.originalUrl);
        //req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/users/login');
    }
};
