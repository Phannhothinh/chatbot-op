import { model, Schema, models } from 'mongoose';

const messageSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  isUser: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists to prevent overwriting during hot reloads
const Message = models.Message || model('Message', messageSchema);

export default Message;
