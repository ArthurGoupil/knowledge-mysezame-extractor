import { Table, Model, Column, ForeignKey } from "sequelize-typescript";

export type CategoryOption = {
  text: "string";
  value: "string";
};

interface Category {
  id: number;
  name: string;
  options: string;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
}

@Table({ timestamps: false })
export class Categories extends Model<Category> {
  @Column
  name: string;

  @Column
  options: string;

  @Column
  deleted_at: Date;

  @Column
  created_at: Date;

  @Column
  updated_at: Date;
}
