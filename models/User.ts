import { model, Schema } from 'mongoose';

// Define the structure of API config values
interface ApiConfigValue {
  apiKey: string;
  model: string;
}

// Define the schema for API configs map
const apiConfigSchema = new Schema<ApiConfigValue>({
  apiKey: { type: String, required: true },
  model: { type: String, required: true },
}, { _id: false });

const userSchema = new Schema({
  id: String,
  name: String,
  email: String,
  apiConfigs: {
    type: Map,
    of: apiConfigSchema,
    default: new Map(),
  },
  activeProvider: {
    type: String,
    default: 'openai',
  },
});

// Ensure apiConfigs is always a Map
userSchema.pre('save', function(next) {
  if (!(this.apiConfigs instanceof Map)) {
    this.apiConfigs = new Map(Object.entries(this.apiConfigs || {}));
  }
  next();
});

const User = model('User', userSchema);

export default User;
