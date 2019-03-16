const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const books = require("../static/booksData");
const Joi = require("joi");

const selectById = tarId => {
  return books.find(a => a._id === parseInt(tarId));
};

const validateInput = book => {
  const schema = {
    title: Joi.string()
      .min(3)
      .required(),
    isbn: Joi.number()
      .integer()
      .min(1000000000000)
      .max(9999999999999)
      .required(),
    authors: Joi.string().required()
  };
  return Joi.validate(book, schema);
};

const validateUniqueIsbn = isbn => {
  const book = books.find(a => a.isbn === isbn);
  return book;
};

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(403).send("Please enter your credentials");
  } else {
    if (authorization === "Bearer my-awesome-token") {
      next();
    } else {
      res.status(403).send("Your credentials have been rejected");
    }
  }
};

protectedRouter.use(verifyToken);

router.route("/").get((req, res) => {
  const query = req.query;
  if (Object.entries(query).length === 0) {
    res.send(books);
  } else {
    const keys = Object.keys(query);
    const filteredBooks = books.filter(book =>
      keys.some(key =>
        book[key].toLowerCase().includes(query[key].toLowerCase())
      )
    );
    res.status(200).send(filteredBooks);
    s;
  }
});

router.route("/:id").get((req, res) => {
  const book = selectById(req.params.id);
  !book ? res.status(404).send("Book Not Found") : res.send(book);
});

protectedRouter.route("/:id").delete((req, res) => {
  const book = selectById(req.params.id);
  if (!book) {
    res.status(404).send("Book Not Found!");
  } else {
    const index = books.indexOf(book);
    books.splice(index, 1);
    res.send(book);
  }
});

protectedRouter.route("/").post((req, res) => {
  const { error } = validateInput(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  } else if (validateUniqueIsbn(req.body.isbn)) {
    res
      .status(400)
      .send("ISBN Is Already In The System, Use PUT/PATCH Instead");
  } else {
    const { title, isbn, authors } = req.body;
    const newBook = {
      _id: books.length + 1,
      title,
      isbn,
      authors
    };
    books.push(newBook);
    res.status(201).send(newBook);
  }
});

module.exports = { router, protectedRouter };
