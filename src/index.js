const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(
    (user) => user.username === username
  )

  if(!user){
    return response.status(400).json({error: "User not exist"})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const userExist = users.find(
    user => user.username === username
  )

  if(userExist){
    return response.status(400).json({error: 'User already exists!'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(users)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  const {title, deadline} = request.body

  const todos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todos)

  return response.status(201).json(todos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params

  const {user} = request

  const {title, deadline} = request.body

  const todo = user.todos.find(
    (todo) =>  todo.id === id
  )

  if(!todo){
    return response.status(400).json({error:"Todo not exist"})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params

  const {user} = request

  const todo = user.todos.find(
    (todo) => todo.id === id
  )

  if(!todo){
    return response.status(400).json({error:"Todo not exist"})
  }

  todo.done = true

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params

  const {user} = request

  const todo = user.todos.find(
    (todo) => todo.id === id
  )

  if(!todo){
    return response.status(404).json({error:"Todo not exist"})
  }

  user.todos.splice(todo, 1)

  return response.status(204)
});

module.exports = app;