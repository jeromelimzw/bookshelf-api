const express = require("express");
const app = express();
const books = require("./routes/books");
app.use(express.json());

app.use("/api/v1/books", books.router);
app.use("/api/v1/books", books.protectedRouter);
module.exports = app;
