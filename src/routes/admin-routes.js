app.post(
  '/login',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/admin');
  },
);

app.get('logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/admin', ensureLoggedIn, (req,res) => {
  res.send(`
  <p>Hér eru leyndarmál</p>
  <p><a href="/">Forsíða</a></p>
  `);
});
