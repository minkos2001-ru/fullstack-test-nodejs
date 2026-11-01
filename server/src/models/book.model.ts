import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import BookCategory from "./book-category.model";

@Table({
  tableName: "books",
  timestamps: false,
})
export default class Book extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare publishedAt: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pages: number;

  @ForeignKey(() => BookCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare categoryId: number | null;

  @BelongsTo(() => BookCategory, {
    foreignKey: "categoryId",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  declare category: BookCategory | null;
}
