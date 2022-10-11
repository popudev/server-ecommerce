const { default: mongoose } = require('mongoose');
const Address = require('../models/Address');

const AddressController = {
  getAddress: async (req, res) => {
    try {
      const addresses = await Address.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $sort: {
            defaultAddress: -1,
            createdAt: 1,
          },
        },
      ]);
      res.status(200).json(addresses);
    } catch (err) {}
  },

  addAddress: async (req, res) => {
    try {
      if (!req.body.defaultAddress) {
        const address = await Address.findOne({
          userId: mongoose.Types.ObjectId(req.user._id),
          defaultAddress: true,
        });
        if (!address) req.body.defaultAddress = true;
      } else {
        await Address.updateOne(
          {
            userId: mongoose.Types.ObjectId(req.user._id),
            defaultAddress: true,
          },
          { defaultAddress: false },
        );
      }

      const newAddress = new Address({
        userId: mongoose.Types.ObjectId(req.user._id),
        fullname: req.body.fullname,
        phone: req.body.phone,
        address: req.body.address,
        defaultAddress: req.body.defaultAddress,
      });

      await newAddress.save();
      res.status(200).json('Add Address Successfully');
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },

  updateAddress: async (req, res) => {
    try {
      if (req.body.defaultAddress) {
        await Address.updateOne({ defaultAddress: true }, { defaultAddress: false });
      }

      await Address.updateOne(
        { _id: req.body._id },
        {
          ...req.body,
        },
      );
      res.status(200).json('Update Successfully');
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },

  updateAddressDefault: async (req, res) => {
    try {
      await Address.updateOne({ defaultAddress: true }, { defaultAddress: false });
      await Address.updateOne({ _id: req.body._id }, { defaultAddress: true });
      res.status(200).json('Update Address Default Successfully');
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },

  deleteAddress: async (req, res) => {
    try {
      await Address.deleteOne({ _id: req.params.id });
      res.status(200).json('Delete Successfully');
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },
};

module.exports = AddressController;
