var express = require('express');
var router = express.Router();
var path = require('path');
var filePath = "./views/index.pug"
 var resolvedPath = path.resolve(filePath);
 console.log(resolvedPath);
 //return res.sendFile(resolvedPath);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'cra-blog' });
});
router.set('views', './views');

const homeOrPostPageRegExp = new RegExp('^/(posts/.+)?$');
router.get(homeOrPostPageRegExp, (req, res) => res.sendFile(`${__dirname}/views/index.pug`));

const ARTICLES = [
    { id: 'post001', title: 'Welcome to Cranium!', avatar: 'images/avatar2.png', author: 'Ben Y', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 3, 4) },
    { id: 'post002', title: 'My Second Post', author: 'Tom Green', body: 'If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 5, 8) },
    { id: 'post003', title: 'My Third Post', author: 'Paul Tim', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 0, 1) },
    { id: 'post004', title: 'My Fourth Post', author: 'Gbens Bee', body: 'If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 0, 2) },
    { id: 'post005', title: 'My Fifth Post', author: 'Ally Rolly', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.', date: new Date(2018, 0, 1) },
    { id: 'post006', title: 'My Sixth Post', author: 'jimmy Hendy', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 0, 2) }
];

const articleIdToArticleMap = ARTICLES.reduce((accumulator, content) => {
    accumulator[content.id] = content;
    return accumulator;
}, {});

//
// Serve HTML fragments of content
//
router.get('/content/articles', (req, res) =>
    // Sort by date descending
    res.send(ARTICLES.sort((articleA, articleB) => articleA.date < articleB.date)));

router.get('/content/articles/:articleId', (req, res) => {
    const article = articleIdToArticleMap[req.params.articleId];
    if (article) {
        res.send(article);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;
