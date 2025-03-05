import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schemas';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    }
})
export class User {
    @Prop()
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    age: number;

    @Prop()
    gender: string;

    @Prop()
    avatarUrl: string;

    @Prop()
    address: string;

    @Prop({ type: Object })
    company: {
        _id: mongoose.Schema.Types.ObjectId;
    };


    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
    role: mongoose.Schema.Types.ObjectId;

    @Prop()
    isActived: boolean;

    @Prop()
    refreshToken: string;

    @Prop({ type: Number, default: 2 }) // Sửa lại định nghĩa này
    premium: number;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('discriminatorKey', 'kind');
UserSchema.set('collection', 'users');

// Xóa tất cả các middleware hiện có nếu có
UserSchema.clearIndexes();

// Override lại method find
const originalFind = UserSchema.methods.find;
UserSchema.methods.find = function(...args) {
  return originalFind.apply(this, args).where('isDeleted').exists(true);
};
// Thêm middleware ở đây, sau khi tạo schema
UserSchema.pre('find', function(next) {
    // Bỏ qua điều kiện isDeleted mặc định
    const query = this.getQuery();
    if (!query.hasOwnProperty('isDeleted')) {
        this.setQuery({ ...query, $or: [{ isDeleted: true }, { isDeleted: false }, { isDeleted: { $exists: false } }] });
    }
    next();
});

UserSchema.pre('countDocuments', function(next) {
    // Áp dụng tương tự cho countDocuments
    const query = this.getQuery();
    if (!query.hasOwnProperty('isDeleted')) {
        this.setQuery({ ...query, $or: [{ isDeleted: true }, { isDeleted: false }, { isDeleted: { $exists: false } }] });
    }
    next();
});

// Thêm middleware cho findOne nếu cần
UserSchema.pre('findOne', function(next) {
    const query = this.getQuery();
    if (!query.hasOwnProperty('isDeleted')) {
        this.setQuery({ ...query, $or: [{ isDeleted: true }, { isDeleted: false }, { isDeleted: { $exists: false } }] });
    }
    next();
});