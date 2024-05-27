const mongoose = require("mongoose");

const categorysSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category Required"],
      unique: [true, "Category must be unique"],
      minlength: [3, "Too short Category name"],
      maxlength: [32, "Too long Category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },

  { timestamps: true }
);
const setImageURL = (doc) => {
  // return image base url + image name
  if (doc.image) {
    const imgURL = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imgURL;
  }
};
// findone, findall and update
categorysSchema.post("init", (doc) => {
  setImageURL(doc);
});
// create
categorysSchema.post("save", (doc) => {
  setImageURL(doc);
});

const categoryModule = mongoose.model("category", categorysSchema);

module.exports = categoryModule;
