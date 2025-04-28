const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');
const path = require('path');
const cors = require('cors')

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(
  cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Allow both localhost and 127.0.0.1
    credentials: true,  // Allow cookies (session cookie) to be sent with the request
    methods: ['GET', 'POST'],  // Allow the necessary HTTP methods
  })
);
app.use(
  session({
    store: new pgSession({ pool: pool, tableName: 'session' }),
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,  // Important for security
      secure: false,   // Set to true for production (if using https)
      sameSite: 'Lax', // Crucial for cross-site cookies
    },
  })
);

// Registration
app.post('/register', async (req, res) => {
  const { fullName, password,email } = req.body;
  try {
    await pool.query('INSERT INTO users (name, password, email) VALUES ($1, $2,$3)', [fullName, password,email]);
    res.json({ success: true, message: 'User registered' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      req.session.user = { id: result.rows[0].id, username: result.rows[0].name };
      res.json({ success: true, user: { id: result.rows[0].id, email: result.rows[0].email }, sessionId: req.sessionID});
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.get('/auth/check', (req, res) => {
  console.log('Session Data:', req.session.user);
  if (req.session.user) {
    res.json({ loggedIn: true, username: req.session.user.username });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ loggedOut: true });
  });
});


app.post('/donate', async (req, res) => {
  const {donorName,donorEmail,donateAmount,donateCurrency,donateMessage,userId} = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO donations (donorName, donorEmail, donateAmount,donateCurrency,donateMessage,user_id) VALUES ($1, $2, $3,$4,$5,$6) RETURNING *',
      [donorName,donorEmail, donateAmount, donateCurrency,donateMessage,userId]
    );
    res.status(200).json({ success: true, donation: result.rows[0] });
  } catch (err) {
    console.error('Error inserting donation:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/services', async (req, res) => {
  try {
    // const result = await pool.query('SELECT * FROM services ORDER BY id');
    const result = await pool.query("SELECT services.*, COUNT(comments.id) AS commentsCount FROM services LEFT JOIN comments ON services.id = comments.service_id GROUP BY services.id ORDER BY services.id DESC;");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/services/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const result = await pool.query(
      'SELECT * FROM likes WHERE service_id = $1 AND user_id = $2', 
      [id, userId]
    );
    if (result.rows.length > 0) {
      return res.json({ success: false, message: 'You have already liked this service' });
    }
    await pool.query('INSERT INTO likes (service_id, user_id) VALUES ($1, $2)', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error liking service' });
  }
});

app.get('/services/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT COUNT(*) FROM likes WHERE service_id = $1', [id]);
    res.json({ likes: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

app.get('/services/:id/comments', async (req, res) => {
  const { id } = req.params;
  let commentsHTML = ``;
  try {
    const result = await pool.query('SELECT * FROM comments WHERE service_id = $1 ORDER BY id DESC', [id]);
    if (result.rows.length > 0) {
      let cHtml = ``
      result.rows.forEach(comment => {
          cHtml += `<div class= "item">
                  <p class="name">${comment.name}</p>
                  <p class="value">${comment.content}</p>
              </div>`;          
      });
      commentsHTML += cHtml;
      res.json({ success: true, html: commentsHTML });
    }
    else{
      res.json({ success: false})
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error commenting service', err });
  }
});

app.post('/services/:id/comment', async (req, res) => {
  const { id } = req.params;
  const {userId, commentText} = req.body;
  try {
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid Request' });
    }
    const userName = userResult.rows[0].name;
    const insertResult = await pool.query(
      'INSERT INTO comments (service_id, user_id, content, name) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, commentText, userName]
    );
    let html = `<div class= "item">
          <p class="name">${userName}</p>
          <p class="value">${commentText}</p>
      </div>`;
    const commentsCount = await pool.query('SELECT count(*) FROM comments WHERE service_id = $1', [id]);
    res.json({ success: true, comment: insertResult.rows[0], html: html, commentsCount: commentsCount.rows[0].count });
  } catch (error) {
    res.json({ success: false, message: "Something went wrong." });
  }
});

app.post("/user/profile", async(req, res) =>{
  const { id } = req.body;
  try {
    const result = await pool.query('SELECT name, email FROM users WHERE id = $1', [id]);

    if (result.rows.length > 0) {
      res.json({success: true, user: result.rows[0]}); 
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/user/profile/update', async (req, res) => {
  const { fullName, password, confirmPassword, email, id } = req.body;
  try {
    if(!fullName){
      res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }
    if(password || confirmPassword){
      if(password != confirmPassword){
        res.status(400).json({ success: false, message: "Possword does not match." });
        return;
      }
    }
    if(password == confirmPassword && password.length > 0){
      await pool.query('UPDATE users SET name = $1, password = $2 WHERE id = $3', [fullName, password, id]);
    }
    else{
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [fullName, id]);
    }
    res.json({ success: true, message: 'Profile Updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

app.post("/user/donations", async(req, res) =>{
  const { id } = req.body;
  try {
    const result = await pool.query('SELECT * FROM donations WHERE user_id = $1', [id]);
    if (result.rows.length > 0) {
      res.json({success: true, donations: result.rows}); 
    } else {
      res.status(404).json({ success: false, message: 'Data not found' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ loggedOut: true });
  });
});


app.get('/', (req, res) => {
    res.send('Hello World!')
  })
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
