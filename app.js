const express = require("express")
const path = require("path")
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, "cricketTeam.db")
let db = null

// Initialize database and server
const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000")
    })
  } catch (e) {
    console.error(`Database Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDatabaseAndServer()

// ----------------------------------------------------
// API 1: Get all players
// ----------------------------------------------------
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map((each) => ({
      playerId: each.player_id,
      playerName: each.player_name,
      jerseyNumber: each.jersey_number,
      role: each.role,
    }))
  )
})

// ----------------------------------------------------
// API 2: Add a new player
// ----------------------------------------------------
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body
  const addPlayerQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES (?, ?, ?);`
  await db.run(addPlayerQuery, [playerName, jerseyNumber, role])
  response.send("Player Added Successfully")
})

// ----------------------------------------------------
// API 3: Get a single player by ID
// ----------------------------------------------------
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ?;`
  const player = await db.get(getPlayerQuery, [playerId])

  if (!player) {
    response.status(404).send({ error: "Player Not Found" })
    return
  }

  response.send({
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  })
})

// ----------------------------------------------------
// API 4: Update player details
// ----------------------------------------------------
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params
  const { playerName, jerseyNumber, role } = request.body

  const updatePlayerQuery = `
    UPDATE cricket_team
    SET player_name = ?, jersey_number = ?, role = ?
    WHERE player_id = ?;`
  await db.run(updatePlayerQuery, [playerName, jerseyNumber, role, playerId])

  response.send("Player Details Updated")
})

// ----------------------------------------------------
// API 5: Delete a player
// ----------------------------------------------------
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ?;`
  await db.run(deletePlayerQuery, [playerId])
  response.send("Player Deleted Successfully")
})

module.exports = app
