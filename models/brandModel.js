const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand Required"],
      unique: [true, "Brand must be unique"],
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
    const imgURL = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imgURL;
  }
};

// findone, findall and update
brandSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
brandSchema.post("save", (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model("Brand", brandSchema);
