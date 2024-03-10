const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios')


public_users.post("/register", (req,res) => {
    const doesExist = (username)=>{
        let userswithsamename = users.filter((user)=>{
          return user.username === username
        });
        if(userswithsamename.length > 0){
          return true;
        } else {
          return false;
        }
      }
    const {username, password} = req.body;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

public_users.get('/books', (req,res) => {
    res.send(JSON.stringify(books, null, 4))
})

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  new Promise((resolve, reject) => {
    try {
        const formattedBooks = JSON.stringify(books, null, 4);
        resolve(formattedBooks)
    } catch (error) {
        reject(error)
    }
  })
  .then((formattedBooks) => {
    res.send(formattedBooks)
  })
  .catch((error) => {
    res.status(500).json({ message: 'Failed to retrieve books: ' + error.message})
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn.trim()
  if(books.hasOwnProperty(isbn)){
    new Promise((resolve, reject) => {
        try {
            const foundISBN = JSON.stringify(books[isbn], null, 4);
            resolve(foundISBN)
        } catch (error) {
            reject(error)
        }
    })
    .then((foundISBN) => res.send(foundISBN))
    .catch ((error) => {
        res.status(500).json({ message: 'Failed to retrieve books: ' + error.message})
    })
  }
  else {
    res.status(403).json({message: "No book with " + isbn + " as ISBN"})
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.replace('/%20/g', ' ').toLowerCase().trim()
  if(author){
    new Promise((resolve, reject)=> {
        try {
            const booksByAuthor = [];
        for (const key in books) {
            if (books.hasOwnProperty(key) && books[key]['author'].toLowerCase() === author) {
                booksByAuthor.push(books[key])
            }
        }
        resolve(booksByAuthor)
        } catch (error) {
            reject(error)
        }
    })
    .then((booksByAuthor) => {
        res.send(JSON.stringify(booksByAuthor, null, 4))
    })
    .catch((error) =>{
        res.status(500).json({ message: 'Failed to retrieve books: ' + error.message})
    })
    
  }else{
    return res.status(403).json({message: "No books by " + author})
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.replace('/%20/g', ' ').toLowerCase().trim();
  
  new Promise((resolve, reject) => {
      try {
          if (title) {
              for (const key in books) {
                  if (books.hasOwnProperty(key) && books[key]['title'].toLowerCase() === title) {
                      resolve(books[key]);
                      return; // Exit loop once book is found
                  }
              }
              reject({ message: "No book with the title " + title });
          } else {
              reject({ message: "Title is empty" });
          }
      } catch (error) {
          reject(error);
      }
  })
  .then((book) => {
      res.send(JSON.stringify(book, null, 4));
  })
  .catch((error) => {
      res.status(403).json({ message: error.message });
  });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn.trim()
    if(books.hasOwnProperty(isbn)){
      return res.send(JSON.stringify(books[isbn]['review'], null, 4))
    }
    else {
      return res.status(403).json({message: "No book with " + isbn + "as ISBN"})
    }
});

module.exports.general = public_users;
