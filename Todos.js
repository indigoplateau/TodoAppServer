
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

// movie schema
var TodoSchema = new Schema({
    //taskID: { type: mongoose.Schema.Types.ObjectId, required: true},
    name: { type: String, required: true},
    dateCreated: { type: Date, required: true},
    dateDue: { type: Date},
    priority: { type: String, enum: ['low', 'medium', 'high']},
    //status: { type: String, enum: ['incomplete', 'complete']},
    status: { type: Boolean},
    users: { type: [{userName: String}], required: true },
    //Order:{ type: Float, required: true }

});

// return the model
module.exports = mongoose.model('Todo', TodoSchema);