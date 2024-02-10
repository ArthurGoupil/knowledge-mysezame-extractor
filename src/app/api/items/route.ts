import { sequelize } from "../../../models";
import * as Items from "../../../models/Items";
import { Op } from "sequelize";

export async function GET(request: Request) {
  await sequelize.authenticate();

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    throw new Error("name not provided");
  }

  const items = await Items.Items.findAll({
    where: {
      name: {
        [Op.like]: `%${name}%`,
      },
      deleted_at: null,
    },
  });

  return Response.json(items.map((item) => ({ name: item.name, id: item.id })));
}
