
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;
mongoose
    .connect(process.env.DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log('Todos DB Connected!'))
    .catch(err => {
        console.log("Todos DB Connection Error" + err.message);
    });
//mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


// todos schema
var TodoSchema = new Schema({

    name: { type: String, required: true},
    dateCreated: { type: Date, required: true},
    dateDue: { type: Date},
    priority: { type: String, enum: ['low', 'medium', 'high']},
    completed: { type: Boolean},
    user: { type: mongoose.Schema.Types.ObjectId, required: true }, //users changed to user, only has ObjectId as attribute -Jake
    order:{ type: Number}

});

// return the model
module.exports = mongoose.model('Todo', TodoSchema);