import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRolePermissions {
  dashboard?: {
    view?: boolean;
  };
  inEntry?: {
    create?: boolean;
  };
  outEntry?: {
    create?: boolean;
  };
  master?: {
    category?: {
      view?: boolean;
      create?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
    party?: {
      view?: boolean;
      create?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
  };
  accounts?: {
    user?: {
      view?: boolean;
      create?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
    role?: {
      view?: boolean;
      create?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
  };
}

export interface IRole extends Document {
  name: string;
  permissions: IRolePermissions;
  createdBy: string; // User email or ID
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    permissions: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
// Note: name field has unique: true which automatically creates an index
// No need to explicitly create an index for name
RoleSchema.index({ createdBy: 1 });

const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);

export default Role;

