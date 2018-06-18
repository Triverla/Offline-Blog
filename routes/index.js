var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'cra-blog' });
});
router.get('/about', function(req, res) {
    res.render('about', { title: 'cra-blog|About' });
});
router.get('/contactus', function(req, res) {
    res.render('contact', { title: 'cra-blog|Contact Us' });
});
const homeOrArticlePageRegExp = new RegExp('^/(articles/.+)?$');
router.get(homeOrArticlePageRegExp, (req, res) => res.render('index', { title: 'Posts' }));

const ARTICLES = [
    { id: 'post001', title: 'Welcome to Cranium!', avatar: 'images/avatar.png', author: 'Ben Y', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 3, 4) },
    { id: 'post002', title: 'My Second Post', avatar: 'images/avatar5.png', author: 'Sam Grimm', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.', date: new Date(2018, 0, 1) },
    { id: 'post003', title: 'My Third Post', avatar: 'images/avatar3.png', author: 'Paul Tim', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 0, 1) },
    { id: 'post004', title: 'My Fourth Post', avatar: 'images/avatar5.png', author: 'Paul Lancy', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.', date: new Date(2018, 0, 1) },
    { id: 'post005', title: 'My Fifth Post', avatar: 'images/avatar5.png', author: 'Ally Rolly', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.', date: new Date(2018, 0, 1) },
    { id: 'post006', title: 'My Sixth Post', avatar: 'images/avatar2.png', author: 'jimmy Hendy', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 0, 2) }
];

const articleIdToArticleMap = ARTICLES.reduce((accumulator, content) => {
    accumulator[content.id] = content;
    return accumulator;
}, {});

//
// Serve HTML fragments of content
//
router.get('/content/articles', (req, res) =>
    // Sort by id descending
    res.send(ARTICLES.sort((articleA, articleB) => articleA.id < articleB.id)));

router.get('/content/articles/:articleId', (req, res) => {
    const article = articleIdToArticleMap[req.params.articleId];
    if (article) {
        res.send(article);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;
