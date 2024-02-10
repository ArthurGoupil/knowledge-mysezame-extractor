import { sequelize } from "../../../models";
import * as Items from "../../../models/Items";
import * as Templates from "../../../models/Templates";
import HTMLtoDOCX from "html-to-docx";

export async function GET(request: Request) {
  await sequelize.authenticate();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    throw new Error("id not provided");
  }

  const item = await Items.Items.findByPk(id);
  const template = await Templates.Templates.findByPk(
    item?.dataValues.template_id
  );

  if (!item) {
    throw new Error("Item not found");
  }

  if (!template) {
    throw new Error("Template not found");
  }

  const templateForm: Templates.FormElement[] = JSON.parse(
    template.dataValues.form
  );
  const itemContent: Items.Content = JSON.parse(item.dataValues.content);

  const decodedContent = await Promise.all(
    templateForm.map((element) =>
      Templates.decodeTemplateFormElement(element, itemContent[element.id])
    )
  );

  const html = decodedContent
    .filter((content) => content?.type !== "link" || !!content.title)
    .map((content) =>
      content ? Templates.getHtmlFromDecodedElement(content) : ""
    )
    .join("");

  var converted = await HTMLtoDOCX(html);

  return new Response(converted, {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  });
}
