var express = require('express');
var app = express();
var multer = require('multer');
var cors = require('cors');
const bodyParser = require('body-parser')
app.use(cors());
app.use(bodyParser.text());

const fs = require('fs');
let booksData = fs.readFileSync('./public/books.json');
let books = JSON.parse(booksData);
let usersData = fs.readFileSync('./public/users.json');
let users = JSON.parse(usersData);
let usersId = parseInt(users[users.length - 1].id) + 1;
let booksId = parseInt(books[books.length - 1].id) + 1;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname )
    }
})

var upload = multer({ storage: storage }).single('file')

app.post('/upload',function(req, res) {

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.file)

    })

});

app.get('/img/:id', function (req, res) {
    let img = books.find((x) => x.id == req.params.id).img
    console.log(img)
    if(fs.existsSync('./public/' + img))
        res.send(fs.readFileSync('./public/' + img))
    else
        res.send(fs.readFileSync('./public/logo512.png'))
})

//logowanie
app.get('/users/:login/:haslo', function(req, res) {
    let user = users.find((x) => x.login == req.params.login);
    if(user === undefined) {
        res.send("-1");
        return;
    }

    if(user.haslo !== req.params.haslo) {
        res.send("-1");
    }
    else
        res.send(user);
})

//książka
app.get('/books/:id', function(req, res) {
    res.send(books.find((x) => x.id == req.params.id));
})

//książki
app.get('/books', function (req, res) {
    res.send(books);
})

//uzytkownicy
app.get('/users', function (req, res) {
    res.send(users);
})

//promote
app.get('/promote/:id', function (req, res) {
    let user = users.find((x) => x.id == req.params.id);
    if(user === undefined)
        return;

    user.uprawnienia = 'admin';

    let data = JSON.stringify(users, null, 2);
    fs.writeFileSync('public/users.json', data);
    res.sendStatus(200);
})

//demote
app.get('/demote/:id', function (req, res) {
    let user = users.find((x) => x.id == req.params.id);
    if(user === undefined)
        return;

    user.uprawnienia = 'user';

    let data = JSON.stringify(users, null, 2);
    fs.writeFileSync('public/users.json', data);
    res.sendStatus(200);
})

//ulubione
app.get('/fav/:id', function (req, res) {
    let user = users.find((x) => x.id == req.params.id);
    if(user === undefined) {
        return;
    }

    res.send(user.ulubione);
})

//dodaj do ulubionych
app.post('/fav/add/:userId/:bookId', function (req, res) {
    let user = users.find((x) => x.id == req.params.userId);
    if(user === undefined) {
        return;
    }

    user.ulubione.push(req.params.bookId);
    let data = JSON.stringify(users, null, 2);
    fs.writeFileSync('public/users.json', data);
    res.sendStatus(200);
})

//usuń z ulubionych
app.post('/fav/remove/:userId/:bookId', function (req, res) {
    let user = users.find((x) => x.id == req.params.userId);
    if(user === undefined) {
        return;
    }

    const index = user.ulubione.indexOf(req.params.bookId);
    if (index > -1)
        user.ulubione.splice(index, 1);

    let data = JSON.stringify(users, null, 2);
    fs.writeFileSync('public/users.json', data);
})

//dodaj uzytkownika
app.post('/user/add/:login/:haslo', function (req, res) {
    let user = users.find((x) => x.login === req.params.login);
    if(user) {
        res.sendStatus(406);
        return;
    }
    console.log(user);
    user = {
        id: usersId.toString(),
        login: req.params.login,
        haslo: req.params.haslo,
        uprawnienia: "user",
        ulubione: []
    }
    usersId++;
    users.push(user);
    let data = JSON.stringify(users, null, 2);
    fs.writeFileSync('public/users.json', data);
    res.sendStatus(200);
})

//usuń użytkownika
app.get('/user/remove/:id', function (req, res) {
    const index = users.findIndex((x) => x.id == req.params.id)
    if (index > -1)
        users.splice(index, 1);

    let data = JSON.stringify(users, null, 2);
    fs.writeFileSync('public/users.json', data);
    res.sendStatus(200);
})

//edytuj książkę
app.post('/books/edit', function (req, res) {
    let newBook = JSON.parse(req.body);
    let index = books.findIndex((x) => x.id === newBook.id);
    books[index] = newBook;
    console.log(newBook);
    let data = JSON.stringify(books, null, 2);
    fs.writeFileSync('public/books.json', data);
    res.sendStatus(200);
})

//dodaj książkę
app.post('/books/add', function (req, res) {
    let newBook = JSON.parse(req.body);
    newBook.id = booksId++;
    books.push(newBook);

    let data = JSON.stringify(books, null, 2);
    fs.writeFileSync('public/books.json', data);
    res.sendStatus(200);
})

//usuń książkę
app.get('/books/remove/:id', function (req, res) {
    const index = books.findIndex((x) => x.id == req.params.id)
    if (index > -1)
        books.splice(index, 1);

    let data = JSON.stringify(books, null, 2);
    fs.writeFileSync('public/books.json', data);
    res.sendStatus(200);
})

app.listen(8000, function() {
    console.log('App running on port 8000');
});
