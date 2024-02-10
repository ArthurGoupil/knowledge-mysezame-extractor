import { Column, Model, Table } from "sequelize-typescript";
import { ContentValue } from "./Items";
import { Categories, CategoryOption } from "./Categories";

type Option = {
  text: string;
  value: string;
};

type Value = {
  label: string;
  id?: number;
  options?: Option[];
  instructions?: string | null;
};

export type FormElement = {
  id: string;
  name:
    | "v-my-select"
    | "v-my-label"
    | "v-my-categories"
    | "v-my-text"
    | "v-my-textarea"
    | "v-my-reference";
  value: Value;
};

type Template = {
  id: number;
  name: string;
  form: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
};

@Table({ timestamps: false, tableName: "templates" })
export class Templates extends Model<Template> {
  @Column
  name: string;

  @Column
  form: string;

  @Column
  created_at: Date;

  @Column
  updated_at: Date;

  @Column
  deleted_at: Date;
}

type Reference = { title: string; link: string; date: string };

type DecodedTemplateFormElement =
  | {
      type: "content";
      title: string;
      instructions?: string | null;
      content: string;
    }
  | {
      type: "html";
      title: string;
      instructions?: string | null;
      content: string;
    }
  | { type: "heading"; instructions?: string | null; content: string }
  | {
      type: "link";
      title: string;
      instructions?: string | null;
      content: Reference[];
    };

export const decodeTemplateFormElement = async (
  formElement: FormElement,
  contentValue: ContentValue
): Promise<DecodedTemplateFormElement | undefined> => {
  switch (formElement.name) {
    case "v-my-select": {
      console.log("v-my-select");

      if (Array.isArray(contentValue)) {
        return {
          type: "content",
          title: formElement.value.label,
          instructions: formElement.value.instructions,
          content: contentValue
            .map(
              (id) =>
                formElement.value.options?.find((option) => option.value === id)
                  ?.text
            )
            .join(", "),
        };
      }

      break;
    }

    case "v-my-label": {
      console.log("v-my-label");

      return {
        type: "heading",
        instructions: formElement.value.instructions,
        content: formElement.value.label,
      };
    }

    case "v-my-categories": {
      console.log("v-my-categories");

      const category = await Categories.findByPk(formElement.value.id);

      console.log("🦊 ~ file: Templates.ts:120 ~ category:", category);

      if (!category) {
        break;
      }

      const categoryOptions: CategoryOption[] = JSON.parse(
        category.dataValues.options
      );

      if (Array.isArray(contentValue)) {
        return {
          type: "content",
          title: category.dataValues.name,
          instructions: formElement.value.instructions,
          content: contentValue
            .map(
              (id) =>
                categoryOptions.find((option) => option.value === id)?.text
            )
            .join(", "),
        };
      }

      break;
    }

    case "v-my-text": {
      console.log("v-my-text");

      if (typeof contentValue === "string") {
        return {
          type: "content",
          title: formElement.value.label,
          instructions: formElement.value.instructions,
          content: contentValue,
        };
      } else {
        return {
          type: "content",
          title: formElement.value.label,
          instructions: formElement.value.instructions,
          content: "Non renseigné",
        };
      }
    }

    case "v-my-textarea": {
      console.log("v-my-textarea");

      if (typeof contentValue === "string") {
        return {
          type: "html",
          title: formElement.value.label,
          instructions: formElement.value.instructions,
          content: contentValue,
        };
      }

      break;
    }

    case "v-my-reference": {
      console.log("v-my-reference");

      if (Array.isArray(contentValue)) {
        console.log("zhefjzejfzejfzjef", formElement.value.label);
        return {
          type: "link",
          title: formElement.value.label,
          instructions: formElement.value.instructions,
          content: contentValue.reduce((acc: Reference[], cur) => {
            if (typeof cur === "object") {
              acc.push({
                title: cur.ref,
                link: cur.link,
                date: cur.date,
              });
            }

            return acc;
          }, []),
        };
      }

      break;
    }
  }
};

export const getHtmlFromDecodedElement = (
  decodedFormElement: DecodedTemplateFormElement
) => {
  switch (decodedFormElement.type) {
    case "content": {
      return `<h2>${decodedFormElement.title}</h2><div>${decodedFormElement.content}<div/><br/>`;
    }

    case "heading": {
      return `<h1>${decodedFormElement.content}</h1><br/>`;
    }

    case "html": {
      return `<h2>${decodedFormElement.title}</h2><div>${decodedFormElement.content}</div><br/>`;
    }

    case "link": {
      return decodedFormElement.content.reduce((acc, cur, index) => {
        return (
          acc +
          `<div><div>${cur.date} ${cur.title}</div><a href="${cur.link}">${
            cur.link
          }<a/></div>${
            index === decodedFormElement.content.length - 1 ? "<br/>" : ""
          }`
        );
      }, `<h2>${decodedFormElement.title}</h2>`);
    }
  }
};
