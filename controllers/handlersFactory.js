const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

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
    if (req.filterObj) {
      filter = req.filterObj;
    }
    const documentCounts = await Model.countDocuments();
    // Build Query
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .pagination(documentCounts)
      .search(modelName)
      .sort()
      .filter()
      .limitFields();

    // Excute Query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const document = await mongooseQuery;

    res
      .status(200)
      .json({ results: document.length, paginationResult, data: document });
  });
