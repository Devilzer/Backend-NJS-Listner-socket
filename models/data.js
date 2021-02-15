const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    entry : {
        type : Array,
        required : true
    }
},{
    timestamps :true
});

const Data = mongoose.model("Data",dataSchema);

module.exports = Data;