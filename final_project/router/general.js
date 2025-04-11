const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  console.log("Registering user:", req.body);
  if (username && password) {
    if (!users[username]) {
      users[username] = { password };
      return res.status(200).json({ message: "User registered successfully." });
    } else {
      return res.status(400).json({ message: "User already exists." });
    }
  } else {
    return res.status(400).json({ message: "Invalid input." });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  new Promise((resolve, reject) => {
    const booklist = Object.keys(books).map((key) => {
      return { isbn: key, ...books[key] };
    });
    if (booklist) {
      resolve(booklist);
    } else {
      reject("Failed to retrieve books.");
    }
  })
    .then((booklist) => {
      res
        .status(200)
        .json({ books: booklist, message: "Successfully retrieved books." });
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found.");
    }
  })
    .then((book) => {
      res.status(200).json({ book, message: "Successfully retrieved book." });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  new Promise((resolve, reject) => {
    const author = req.params.author;
    const booksByAuthor = Object.keys(books)
      .filter((key) => books[key].author === author)
      .map((key) => {
        return { isbn: key, ...books[key] };
      });
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found by this author.");
    }
  })
    .then((booksByAuthor) => {
      res.status(200).json({
        books: booksByAuthor,
        message: "Successfully retrieved books.",
      });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  new Promise((resolve, reject) => {
    const title = req.params.title;
    const booksByTitle = Object.keys(books)
      .filter((key) => books[key].title === title)
      .map((key) => {
        return { isbn: key, ...books[key] };
      });
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found with this title.");
    }
  })
    .then((booksByTitle) => {
      res
        .status(200)
        .json({
          books: booksByTitle,
          message: "Successfully retrieved books.",
        });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const reviews = books[isbn].reviews;
  if (reviews) {
    res.send(reviews);
    return res.status(200).json({ message: "Successfully retrieved reviews." });
  }
  return res.status(404).json({ message: "No reviews found for this book." });
});

module.exports.general = public_users;
