const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validUser = users.filter((user) => {
        return user.username === username && user.password === password
    })
    return validUser.length > 0 ? true : false
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }

    if(authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            username: username
        }, 'fingerprint_customer', { expiresIn: 60 * 60})
        req.session.authorization ={
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }


});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewBody = req.query.review;
    const user = req.session.authorization['username'];

    try {
        if (user) {
            let bookToReview = books[isbn];
            // Check if the book exists
            if (bookToReview) {

                // Add or update the review for the user
                bookToReview.reviews[user] = reviewBody;

                res.send(JSON.stringify(bookToReview.reviews, null, 4));
            } else {
                res.status(404).json({ message: 'Book not found' });
            }
        } else {
            res.status(403).json({ message: 'You need to login' });
        }
    } catch (error) {
        res.send('issues')
        //res.status(500).json({ message: error.message + " "  + user});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const user = req.session.authorization['username'];
    try {
        if (user) {
            let bookWithReview = books[isbn];
            // Check if the book exists
            if (bookWithReview) {

                // Add or update the review for the user
                delete bookWithReview.reviews[user]

                res.status(200).json({ message: 'review has been deleted' })
            } else {
                res.status(404).json({ message: 'Book not found' });
            }
        } else {
            res.status(403).json({ message: 'You need to login' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message + " "  + user});
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
