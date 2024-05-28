const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose
    .connect(
      "mongodb+srv://ahmedzeintsu:WbcdS0CaYK7jPbZq@cluster0.1uj7ugs.mongodb.net/E_commerce?retryWrites=true&w=majority"
    )
    .then((con) => {
      console.log(`Mogoose Host :${con.connection.host}`);
    });

};
module.exports = dbConnection;
