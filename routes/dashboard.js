var express = require('express');
var router = express.Router();
var moment = require('moment');
var striptags = require('striptags');
var firebaseAdminDb = require('../services/firebase-admin')

var categoriesRef = firebaseAdminDb.ref('/categories/')
var articlesRef = firebaseAdminDb.ref('/articles')

//article
router.get('/article/create', function(req, res, next) {
    categoriesRef.once('value').then(function(snapshot) {
        const categories = snapshot.val()
        // console.log('categories ',categories)
        res.render('dashboard/article', {
             title: 'Express' ,
             categories
        });
    })
});
//article單一
router.get('/article/:id', function(req, res, next) {
    const id = req.param('id')
    // console.log(id)
    let categories = {}
    categoriesRef.once('value').then(function(snapshot) {
        categories= snapshot.val()
        return articlesRef.child(id).once('value')
    }).then(function(snapshot) {
        // console.log('categories ',categories)
        const article = snapshot.val()
        // console.log(article) 
        res.render('dashboard/article', {
             title: 'Express' ,
             categories,
             article
        });
    })
});

//article新增方法
router.post('/article/create', function(req, res) {
    // console.log(req.body)
    const data = req.body
    const articleRef = articlesRef.push()
    const key = articleRef.key
    const updateTime = Math.floor(Date.now() / 1000)
    data.id = key
    data.update_time = updateTime
    // console.log(data)
    articleRef.set(data).then(function(){
        res.redirect(`/dashboard/article/${key}`)
    })
})
//article特定單一文章更新
router.post('/article/update/:id', function(req, res) {
    const data = req.body
    const id = req.param('id')
    const updateTime = Math.floor(Date.now() / 1000)
    // data.id = key
    data.update_time = updateTime
    console.log(data)
    // res.redirect(`/dashboard/article/${id}`)
    articlesRef.child(id).update(data).then(function(){
        res.redirect(`/dashboard/article/${id}`)
    })
})
//article刪除方法
router.post('/article/delete/:id', function(req, res) {
    const id = req.param('id')
    // console.log('id',id)
    articlesRef.child(id).remove();
    req.flash('info','文章已刪除') //存在session裡
    res.send('文章已刪除')
    res.end() //行為已結束
    // res.redirect('/dashboard/categories')
})


//archives
router.get('/archives', function(req, res, next) {
    const status = req.query.status || 'public'
    // console.log(status)
    let categories = {}
    categoriesRef.once('value').then(function(snapshot) { 
        categories = snapshot.val()
        const categoryId = '-NUuRV9cKuudvLDrmHWe';
        const categoryName = categories[categoryId].name;
        // console.log(categoryName); 
        // console.log('categories',categories)
        return articlesRef.orderByChild('update_time').once('value')
    }).then(function(snapshot){
        const articles = []
        snapshot.forEach(function(snapshotChild){
            // console.log('child:', snapshotChild.val())
            if(status === snapshotChild.val().status){
                articles.push(snapshotChild.val())
            }
        })
        // console.log(categories,articles)
        articles.reverse()
        res.render('dashboard/archives', {
             title: 'Express' ,
             articles,
             categories,
             moment,
             striptags,
             status
        });
  })
});








//categories
router.get('/categories', function(req, res, next) {
    const messages = req.flash('info')
    categoriesRef.once('value').then(function(snapshot) {
        const categories = snapshot.val()
        // console.log(categories)
        res.render('dashboard/categories', {
             title: 'Express',
             messages,
             hasInfo: messages.length > 0,
             categories 
            });
    })
});


//categories新增方法
router.post('/categories/create', function(req, res) {
    const data = req.body;
    console.log(data)
    const categoryRef = categoriesRef.push();
    const key = categoryRef.key;
    data.id = key;
    //判斷用戶是否建立一樣分類
    categoriesRef.orderByChild('path').equalTo(data.path).once('value')
    .then(function(snapshot){
        if(snapshot.val() !==  null ){
            req.flash('info','已有相同路徑')
            res.redirect('/dashboard/categories')
        }else{
            categoryRef.set(data).then(function(){
            res.redirect('/dashboard/categories')
         })
        }
    })
})

//categories刪除方法
router.post('/categories/delete/:id', function(req, res) {
    const id = req.param('id')
    // console.log('id',id)
    categoriesRef.child(id).remove();
    req.flash('info','欄位已刪除') //存在session裡
    res.redirect('/dashboard/categories')
})



module.exports = router; 