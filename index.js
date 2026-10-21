require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Task = require("./models/Task");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

const app = express();
app.use(express.json()); 

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connesso a MongoDB"))
  .catch((err) => console.error("Errore di connessione:", err.message));

app.get("/", (req, res) => {
  res.send("Ciao dal server");
});


//operazioni crud per vedere,aggiungere,modificare ed eliminare task
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ errore: err.message });
  }
});

app.post("/tasks", auth, async (req, res) => {
  try {
    const nuovoTask = await Task.create(req.body);
    res.status(201).json(nuovoTask);
  } catch (err) {
    res.status(400).json({ errore: err.message });
  }
});

app.put("/tasks/:id", auth, async (req, res) => {
  try {
    const taskAggiornato = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!taskAggiornato) {
      return res.status(404).json({ errore: "Task non trovato" });
    }
    res.json(taskAggiornato);
  } catch (err) {
    res.status(400).json({ errore: err.message });
  }
});

app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const taskEliminato = await Task.findByIdAndDelete(req.params.id);
    if (!taskEliminato) {
      return res.status(404).json({ errore: "Task non trovato" });
    }
    res.json({ messaggio: "Task eliminato" });
  } catch (err) {
    res.status(400).json({ errore: err.message });
  }
});



//rotta /register che salva email e password cifrata
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const passwordCifrata = await bcrypt.hash(password, 10);
    const utente = await User.create({ email, password: passwordCifrata }); 
    res.status(201).json({ messaggio: "Utente registrato", id: utente._id });
  } catch (err) {
    res.status(400).json({ errore: err.message });
  }
});


//rotta per login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const utente = await User.findOne({ email });
    if (!utente) {
      return res.status(401).json({ errore: "Credenziali non valide" });
    }

    const passwordCorretta = await bcrypt.compare(password, utente.password);
    if (!passwordCorretta) {
      return res.status(401).json({ errore: "Credenziali non valide" });
    }

    const token = jwt.sign({ id: utente._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ errore: err.message });
  }
});



app.listen(3000, () => {
  console.log("Server in ascolto sulla porta 3000");
});
