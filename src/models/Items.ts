import { Table, Model, Column, ForeignKey } from "sequelize-typescript";

export type ContentValue =
  | string
  | string[]
  | null
  | { ref: string; date: string; link: string }[];

export type Content = Record<string, ContentValue>;

interface Item {
  id: number;
  template_id: number;
  content: string;
  status: "completed" | "partially" | "uncompleted";
  name: string;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

@Table({ timestamps: false })
export class Items extends Model<Item> {
  @Column
  template_id: string;

  @Column
  content: string;

  @Column
  status: "completed" | "partially" | "uncompleted";

  @Column
  name: string;

  @Column
  created_by: number;

  @Column
  updated_by: number;

  @Column
  created_at: Date;

  @Column
  updated_at: Date;

  @Column
  deleted_at: Date;
}
