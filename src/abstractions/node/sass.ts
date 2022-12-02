import * as sass from "sass";
import { Uri } from "vscode";

export async function compile(
  content: string,
  indentedSyntax: boolean,
  importUri: Uri
) {
  var path = importUri.path;
  if (path.startsWith("/")) {
    path = path.substring(1);
  }
  const { css } = sass.renderSync({
    data: content,
    indentedSyntax,
    includePaths: [path],
  });

  return css;
}