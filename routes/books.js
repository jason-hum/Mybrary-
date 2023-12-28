const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const { render } = require('ejs')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
 
// all books route
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })   
    } catch (error) {
        res.redirect('/')
    }
})

// new book route  
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// create book route
router.post('/', async (req, res) => {
    //console.log(fileName, req.body.bookTitle)
    //console.log(req.body)

    const book = new Book({
        title: req.body.bookTitle,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description 
    })

    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        //res.redirect(`books/${newBook.id}`)  
        res.redirect('books')
    } catch {
        renderNewPage(res, book, true) 
    }
})
  
async function renderNewPage(res, book, hasError=false ) {
    try {
        const authors = await Author.find({})
        const book = new Book()
        const params = {
            authors: authors,
            book: book 
        }
        if (params.hasError) params.errorMessage = 'Error creating book'
        res.render('books/new', params)
    } catch (error) {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router