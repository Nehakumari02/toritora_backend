const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    verificationCode: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 6,
        validate: {
            validator: function(v) {
                return /^[0-9]{6}$/.test(v);
            },
            message: props => `${props.value} is not a valid verification code!`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const VerificationModel = mongoose.model('Verification', VerificationSchema);

module.exports = VerificationModel;
