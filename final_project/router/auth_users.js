const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  console.log(users);
  return users[username] && users[username].password === password;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Logging in user:", req.body);
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }
  if (authenticatedUser(username, password)) {
    // Generate an access token
    const accessToken = jwt.sign({ data: username }, "access", {
      expiresIn: 60 * 60, // 1 hour
    });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User logged in successfully." });
  }
  return res.status(401).json({ message: "Invalid username or password." });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // You have to give a review as a request query & it must get posted with the username (stored in the session) posted. If the same user posts a different review on the same ISBN, it should modify the existing review. If another user logs in and posts a review on the same ISBN, it will get added as a different review under the same ISBN.

  const { review } = req.body;
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
  } else {
    books[isbn].reviews[username] = review;
  }
  res.send(books[isbn]);
  return res.status(200).json({ message: "Review added successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Only the user who posted the review can delete it. The request must contain the username in the session and the review to be deleted as a request query.

  const { review } = req.body;
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully." });
  }
  return res.status(404).json({ message: "Review not found." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
