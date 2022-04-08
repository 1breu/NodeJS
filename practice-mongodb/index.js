const { MongoClient } = require("mongodb");
// Connection URI to local mongod instance
const uri =
  "mongodb://localhost:27017";
// Create a new MongoClient
const client = new MongoClient(uri);
// Array of data to work with
const reviews = [
   { name: "Assassin's Creed: Odyssey", score: "4", review: "Fun game about Greek mythology."},
   { name: "Halo: Infinite", score: "4", review: "Classic FPS multiplayer." },
   { name: "Forza: Horizon 5", score: "4", review: "Fast cars go VROOM!"}
];
const outputHeaders = ["CREATE","READ","UPDATE","DELETE"];
async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Create new database gamesDB
    const database = client.db("gamesDB");

    // Establish and verify connection to gamesDB database
    await database.command({ ping: 1 });
    console.log("Connected successfully to server");

    // Create new collection to edit
    const gamesReviewed = database.collection("gamesReviewed");

    // CREATE reviews data to gamesReviewed collection in gamesDB database
    const insertManyresult = await gamesReviewed.insertMany(reviews);
    console.log(outputHeaders[0] + "/" + outputHeaders[1] + ":");
    console.log(`${insertManyresult.insertedCount} documents were inserted.`);

    // READ data from gamesReviewed
    const options = {projection: { _id: 0, name: 1, score: 1 }};
    const foundGames = await gamesReviewed.find({}, options).toArray();
    console.log(foundGames);

    // UPDATE games score
    const gameToUpdate = {name: "Assassin's Creed: Odyssey"};
    const newScore = {$set: {score: "5"}};
    const options2 = {projection: { _id: 0, name: 1, score: 1, review: 1 }};
    const updateGame = await gamesReviewed.updateOne(gameToUpdate, newScore);
    const findUpdated = await gamesReviewed.findOne({name: "Assassin's Creed: Odyssey"},options2);
    console.log(outputHeaders[2] + ":");
    console.log(updateGame.matchedCount + " document(s) found, updated the game: " + findUpdated.name);
    console.log(findUpdated);

    // Make a new game review
    const newGameReview = {name:"DOOM: Eternal", score: "5", review: "Rip & tear!"};
    const addGameReview = await gamesReviewed.insertOne(newGameReview);
    const findNewReview = await gamesReviewed.findOne({name: "DOOM: Eternal"},options2);
    console.log("New game review:");
    console.log(findNewReview);

    // DELETE new game review
    const deleteGame = await gamesReviewed.deleteOne({name: "DOOM: Eternal"});
    if (deleteGame.deletedCount === 1)
    {
      console.log(outputHeaders[3] + ":");
      console.log("Deleted review");
    }

    // Drop gamesReviewed collection
    const dropCollection = await gamesReviewed.drop();
    if (dropCollection)
    {
      console.log("gamesReviewed collection deleted")
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
