import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, default: Date.now },
    age: { type: Number, required: true },
});
export default mongoose.model('User', userSchema);
