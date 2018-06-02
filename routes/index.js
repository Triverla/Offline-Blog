var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'cra-blog' });
});

//
// Serve shell for / and /articles/:articleId
//
const homeOrPostPageRegExp = new RegExp('^/(posts/.+)?$');
router.get(homeOrPostPageRegExp, (req, res) => res.sendFile(`${__dirname}/views/index.pug`));

const POSTS = [
    { id: 'post001', title: 'Welcome to Cranium!', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 3, 4) },
    { id: 'post002', title: 'My Second Post', body: 'If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 5, 8) },
    { id: 'post003', title: 'My Third Post', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 0, 1) },
    { id: 'post004', title: 'My Fourth Post', body: 'If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 0, 2) },
    { id: 'post005', title: 'My Fifth Post', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.', date: new Date(2018, 0, 1) },
    { id: 'post006', title: 'My Sixth Post', body: '<p>If you’re impatient to start digging into the code, it’s available here. Suggestions or improvements are welcome. Simply create an issue in the repo.</p>', date: new Date(2018, 0, 2) }
];

const postIdToPostMap = POSTS.reduce((accumulator, content) => {
    accumulator[blog.id] = blog;
    return accumulator;
}, {});

//
// Serve HTML fragments of content
//
router.get('/blog/posts', (req, res) =>
    // Sort by date descending
    res.send(POSTS.sort((postA, postB, postC, postD, postE) => postA.date < postB.date < postC.date < postD.date < postE.date)));

router.get('/blog/posts/:postId', (req, res) => {
    const post = postIdToPostMap[req.params.postId];
    if (post) {
        res.send(post);
    } else {
        res.sendStatus(404);
    }
});



module.exports = router;
