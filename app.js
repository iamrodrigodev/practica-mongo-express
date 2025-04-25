const express = require('express');
const { connectToDb, getDb } = require('./db')
const {ObjectId} = require('mongodb');

// ini app & middleware
const app = express();
app.use(express.json())

// db connection
connectToDb((err)=> {
	if (!err){
		app.listen(3000 ,() => {
			console.log('app listening on port 3000')
		});
		db = getDb();
	}
})
	

//app.listen( 3000, () => {
//    console.log("App listening on port 3000")
//} );


// routes
app.get('/books', (req, res) => {
	let books = []
	db.collection('books')
		.find()
		.sort({author:1})
		.forEach( book => books.push(book) )
		.then( ()=> {
			res.status(200).json(books)
		})
		.catch( () => {
			res.status(500).json( {error:'could not fetch'})
		})

})

app.get('/books/:id', (req, res) => {

	if (ObjectId.isValid(req.params.id)) {

		db.collection('books')
			.findOne({_id:new ObjectId(req.params.id)})
			.then(doc => {
				res.status(200).json(doc)
			})
			.catch(err => {
				res.status(500).json( {error:'could not fetch'})
			})
		}
		else {
        res.status(500).json( {error:'invalid id'})
    }
})

app.post('/books', (req, res) => {
	let book = req.body;
	db.collection('books')
	.insertOne(book)
	.then( (result)=> {
        res.status(201).json(result)
    })
	.catch( err => {
        res.status(500).json( {error:'could not insert'})
    })
})


app.delete('/books/:id', (req, res) => {
	if (ObjectId.isValid(req.params.id)) {
		db.collection('books')
		.deleteOne({_id:new ObjectId(req.params.id)})
		.then( (result)=> {
            res.status(200).json(result)
        })
		.catch( err => {
            res.status(500).json( {error:'could not delete'})
        })
	}		
	else {
        res.status(500).json( {error:'invalid id'})
    }
})

app.patch('/books/:id', (req,res) => {
	const updates = req.body
	if (ObjectId.isValid(req.params.id)) {
		db.collection('books')
		.updateOne({_id:new ObjectId(req.params.id)}, {$set:updates})
		.then( (result)=> {
            res.status(200).json(result)
        })
		.catch( err => {
            res.status(500).json( {error:'could not update'})
        })
	}
	else {
		res.status(500).json( {error:'invalid id'})
    }
})

app.get('/books', (req, res) => {
	// for pagination
	const page = req.query.page || 0;
	const limit = req.query.limit || 3;

	let books = []
	db.collection('books')
		.find()
		.sort({author:1})
		.skip(page * limit) // pagination
		.limit(limit) // pagination
		.forEach( book => books.push(book) )
		.then( ()=> {
			res.status(200).json(books)
		})
		.catch( () => {
			res.status(500).json( {error:'could not fetch'})
		})

})


// Routes for users (CRUD operations)
app.post('/users', (req, res) => {
    const user = req.body;
  
    // Validate user input (you can expand this as needed)
    if (!user.name || !user.lastname || !user.email || !user.password || !user.date_of_birth) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    db.collection('users')
      .insertOne(user)
      .then((result) => {
        res.status(201).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: 'could not insert user' });
      });
  });
  
  app.get('/users', (req, res) => {
    let users = [];
    db.collection('users')
      .find()
      .forEach((user) => users.push(user))
      .then(() => {
        res.status(200).json(users);
      })
      .catch(() => {
        res.status(500).json({ error: 'could not fetch users' });
      });
  });
  
  app.get('/users/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
      db.collection('users')
        .findOne({ _id: new ObjectId(req.params.id) })
        .then((user) => {
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.status(200).json(user);
        })
        .catch((err) => {
          res.status(500).json({ error: 'could not fetch user' });
        });
    } else {
      res.status(500).json({ error: 'invalid id' });
    }
  });
  
  app.patch('/users/:id', (req, res) => {
    const updates = req.body;
    if (ObjectId.isValid(req.params.id)) {
      db.collection('users')
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((err) => {
          res.status(500).json({ error: 'could not update user' });
        });
    } else {
      res.status(500).json({ error: 'invalid id' });
    }
  });
  
  app.delete('/users/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
      db.collection('users')
        .deleteOne({ _id: new ObjectId(req.params.id) })
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((err) => {
          res.status(500).json({ error: 'could not delete user' });
        });
    } else {
      res.status(500).json({ error: 'invalid id' });
    }
  });