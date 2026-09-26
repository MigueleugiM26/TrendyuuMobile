import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";

type SelectOption = { id: string; name: string; color: string };

// Cliente oficial do Notion, autenticado com o token da integração
export const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Conversor de blocos do Notion -> Markdown
const n2m = new NotionToMarkdown({ notionClient: notion });

// Desde a versão 2025-09-03 da API do Notion, "database" e "data source"
// são coisas separadas. Para databases de fonte única (o caso normal),
// o ID do data source geralmente é o mesmo que você copia da URL da database.
const DATA_SOURCE_ID = process.env.NOTION_DATABASE_ID as string;

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string | null;
  date: string;
  tags: string[];
};

type RichTextProp = {
  rich_text?: RichTextItemResponse[];
  title?: RichTextItemResponse[];
};

type FileProp = {
  files?: Array<
    | { type: "external"; external: { url: string } }
    | { type: "file"; file: { url: string; expiry_time: string } }
  >;
};

type MultiSelectProp = {
  multi_select?: Array<SelectOption>;
};

type DateProp = {
  date?: { start: string; end: string | null; time_zone: string | null };
};

type PageProperties = {
  Slug: RichTextProp;
  Title: RichTextProp;
  Excerpt: RichTextProp;
  Cover: FileProp;
  Date: DateProp;
  Tags: MultiSelectProp;
  Published: { checkbox: boolean };
};

// Helper: extrai texto plano de uma propriedade "rich_text" ou "title"
function getPlainText(prop: RichTextProp): string {
  if (!prop) return "";
  const arr = prop.title ?? prop.rich_text ?? [];
  return arr.map((t) => t.plain_text).join("");
}

// Helper: extrai a URL de capa (pode ser upload direto no Notion ou link externo)
function getCoverUrl(prop: FileProp): string | null {
  const file = prop?.files?.[0];
  if (!file) return null;
  return file.type === "external"
    ? file.external.url
    : (file.file?.url ?? null);
}

/**
 * Busca todos os posts publicados (Published = true), ordenados por Date desc.
 * Usado na listagem /blog.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const response = await notion.dataSources.query({
    data_source_id: DATA_SOURCE_ID,
    filter: {
      property: "Published",
      checkbox: { equals: true },
    },
    sorts: [{ property: "Date", direction: "descending" }],
  });

  return (response.results as PageObjectResponse[]).map((p) => {
    const props = p.properties as unknown as PageProperties;

    return {
      id: p.id,
      slug: getPlainText(props.Slug),
      title: getPlainText(props.Title),
      excerpt: getPlainText(props.Excerpt),
      cover: getCoverUrl(props.Cover),
      date: props.Date?.date?.start ?? "",
      tags: (props.Tags?.multi_select ?? []).map((t) => t.name),
    };
  });
}

/**
 * Busca metadados de um post específico pelo slug.
 * Retorna null se não encontrar (ou não estiver publicado).
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await notion.dataSources.query({
    data_source_id: DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "Published", checkbox: { equals: true } },
      ],
    },
  });

  const page = response.results[0] as PageObjectResponse | undefined;
  if (!page) return null;

  const props = page.properties as unknown as PageProperties;
  return {
    id: page.id,
    slug: getPlainText(props.Slug),
    title: getPlainText(props.Title),
    excerpt: getPlainText(props.Excerpt),
    cover: getCoverUrl(props.Cover),
    date: props.Date?.date?.start ?? "",
    tags: (props.Tags?.multi_select ?? []).map((t) => t.name),
  };
}

/**
 * Converte o corpo (blocos) de uma página Notion em Markdown,
 * pronto pra renderizar com react-markdown.
 */
export async function getPostMarkdown(pageId: string): Promise<string> {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const mdString = n2m.toMarkdownString(mdBlocks);
  return mdString.parent;
}
