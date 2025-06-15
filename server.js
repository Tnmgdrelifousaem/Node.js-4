const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(bodyParser.json());

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing users file:', err);
    return false;
  }
}

app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.params.id);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.post('/users', (req, res) => {
  const users = readUsers();
  const newUser = {
    id: Date.now().toString(),
    ...req.body
  };
  
  users.push(newUser);
  
  if (writeUsers(users)) {
    res.status(201).json(newUser);
  } else {
    res.status(500).json({ message: 'Failed to save user' });
  }
});

app.put('/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const updatedUser = {
    ...users[index],
    ...req.body,
    id: req.params.id
  };
  
  users[index] = updatedUser;
  
  if (writeUsers(users)) {
    res.json(updatedUser);
  } else {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

app.delete('/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  users.splice(index, 1);
  
  if (writeUsers(users)) {
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
