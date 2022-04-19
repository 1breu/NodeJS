const mongoose = require("mongoose");

const reviewSchema = {
  name: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: String
};

const gameReviews = mongoose.model("review", reviewSchema);

const acOdyssey = new gameReviews({
  name: "Assassin's Creed: Odyssey",
  score: 4,
  review: "Fun game about Greek mythology."
});

const halo = new gameReviews({
  name: "Halo: Infinite",
  score: 4,
  review: "Classic FPS fun."
});

const forza5 = new gameReviews({
  name: "Forza Horizon: 5",
  score: 4,
  review: "Fast cars go ZOOM!"
});

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gamesReviews2');

  //Create new data in dbs
  await gameReviews.insertMany([acOdyssey, halo, forza5], function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("insertMany operation successfully completed.");
    }
  });

  //Read data from dbs and output to console
  const findReviews = await gameReviews.find({}).clone();
  console.log(findReviews);

  //Update existing data
  const findThisGame = {name: "Assassin's Creed: Odyssey"};
  const updateThisField = {score: 5};
  const updateNow = await gameReviews.findOneAndUpdate(findThisGame,
    updateThisField, function(err){
      if (err) console.log(err);
    }).clone();
  const updatedReview = await gameReviews.findOne(findThisGame).clone();
  console.log("Updated: " + updatedReview.name + " score: " + updatedReview.score);

  //Delete all data inserted during this time
  /*const deleteReviews = await gameReviews.deleteMany({});
  if (deleteReviews) {
    console.log("Reviews deleted. Clearing collection and db.");
  }*/
  //await gameReviews.collection.drop();
  //await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
}
