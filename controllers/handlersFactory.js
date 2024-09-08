const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const mongoose = require("mongoose");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (document) {
      if (Model.modelName === "Review") {
        const productId = document.product;

        // Recalculate average ratings and quantity for the product
        await Model.calcAverageRatingsAndQuantity(productId);
      }

      res.status(200).send();
    } else {
      return next(new ApiError(`No Document for this id ${id}`, 404));
    }
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      // res.status(404).json({ msg: `Not Found Categorie For This ID : ${catId}` });
      return next(
        new ApiError(`Not Found Document For This ID : ${req.params.id}`, 404)
      );
    }

    // Trigger "save" event when update dcuments
    document.save();
    res.status(200).json({ success: true, data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({ data: newDocument });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1) build query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) excute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`Not Found Document For This ID : ${id}`, 404));
    }

    res.status(200).json({ success: true, data: document });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};

    // Merge with additional filters if they exist
    if (req.filterObj) {
      filter = { ...filter, ...req.filterObj };
    }
    if (modelName === "products") {
      // Extract category filter
      const categoryFilter = req.query.category;
      const brandFilter = req.query.brand;

      if (categoryFilter) {
        try {
          // If categoryFilter.in is present, handle as an array; otherwise, handle as a single value
          const categoryIds = Array.isArray(categoryFilter.in)
            ? categoryFilter.in
            : [categoryFilter.in || categoryFilter]; // Support both .in and direct category query

          // Convert category IDs to ObjectId
          const objectIds = categoryIds.map((id) => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
              throw new Error(`Invalid ObjectId: ${id}`);
            }
            return new mongoose.Types.ObjectId(id);
          });

          // Apply category filter (either as a single ObjectId or with $in for multiple)
          filter.category =
            objectIds.length === 1 ? objectIds[0] : { $in: objectIds };
        } catch (err) {
          // Handle conversion errors
          console.error("Error converting category ID to ObjectId:", err);
          return res.status(400).json({ error: "Invalid category ID" });
        }
      }
      if (brandFilter) {
        try {
          // If categoryFilter.in is present, handle as an array; otherwise, handle as a single value
          const brandIds = Array.isArray(brandFilter.in)
            ? brandFilter.in
            : [brandFilter.in || brandFilter]; // Support both .in and direct category query

          // Convert category IDs to ObjectId
          const objectIds = brandIds.map((id) => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
              throw new Error(`Invalid ObjectId: ${id}`);
            }
            return new mongoose.Types.ObjectId(id);
          });

          // Apply category filter (either as a single ObjectId or with $in for multiple)
          filter.brand =
            objectIds.length === 1 ? objectIds[0] : { $in: objectIds };
        } catch (err) {
          // Handle conversion errors
          console.error("Error converting category ID to ObjectId:", err);
          return res.status(400).json({ error: "Invalid category ID" });
        }
      }
    }
    // Count documents with the applied filter
    const documentCounts = await Model.countDocuments(filter);

    // Build Query
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .pagination(documentCounts)
      .search(modelName)
      .sort()
      .filter()
      .limitFields();

    // Execute Query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const document = await mongooseQuery;

    res
      .status(200)
      .json({ results: document.length, paginationResult, data: document });
  });
