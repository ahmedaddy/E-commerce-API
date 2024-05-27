const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then((con) => {
      console.log(`Mogoose Host :${  con.connection.host}`);
    })

};
module.exports = dbConnection;
