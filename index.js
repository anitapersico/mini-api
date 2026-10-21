require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Task = require("./models/Task");

const app = express();
app.use(express.json()); 

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connesso a MongoDB"))
  .catch((err) => console.error("Errore di connessione:", err.message));

app.get("/", (req, res) => {
  res.send("Ciao dal server");
});


app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ errore: err.message });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const nuovoTask = await Task.create(req.body);
    res.status(201).json(nuovoTask);
  } catch (err) {
    res.status(400).json({ errore: err.message });
  }
});

app.put("/tasks/:id", async (req, res) => {
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

app.delete("/tasks/:id", async (req, res) => {
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



app.listen(3000, () => {
  console.log("Server in ascolto sulla porta 3000");
});
