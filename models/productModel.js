const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Too Short Product Title"],
      maxlength: [100, "Too Long Product Title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product Description Is Required"],
      minlength: [20, "Too Short Product Description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product Quantity Is Required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product Psrice Is Required"],
      max: [200000, "Too Long Product Price"],
    },
    priceAfterDescount: {
      type: Number,
    },
    colors: {
      type: [String],
    },
    imageCover: {
      type: String,
      required: [true, "Product Image cover is required"],
    },
    images: [String],
    category: {
      type: mongoose.Types.ObjectId,
      ref: "category",
      required: [true, "Product must be belong to category"],
    },
    subCategories: [
      {
        type: mongoose.Types.ObjectId,
        ref: "subCategory",
      },
    ],
    brand: {
      type: mongoose.Types.ObjectId,
      ref: "brand",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,

    // to enable virtual populate
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// mongoose query midelware
productSchema.pre(/^find/, function (next) {
  this.populate({ path: "category", select: "name -_id" });
  next();
});

const setImageURL = (doc) => {
  // return image base url + image name
  if (doc.imageCover) {
    const imgURL = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imgURL;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imgURL = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imgURL);
    });
    doc.images = imagesList;
  }
};

// findone, findall and update
productSchema.post("init", (doc) => {
  setImageURL(doc);
});

// create
productSchema.post("save", (doc) => {
  setImageURL(doc);
});



module.exports = mongoose.model("Product", productSchema);
