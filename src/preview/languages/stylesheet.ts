import * as path from "path";
import * as vscode from "vscode";
import { TextDocument } from "vscode";
import * as config from "../../config";
import { store } from "../../store";
import { byteArrayToString } from "../../utils";
const output = vscode.window.createOutputChannel("Sass Compilation");
export const STYLESHEET_BASE_NAME = "style";

const StylesheetLanguage = {
  css: ".css",
  less: ".less",
  sass: ".sass",
  scss: ".scss",
};

export const STYLESHEET_EXTENSIONS = [
  StylesheetLanguage.css,
  StylesheetLanguage.less,
  StylesheetLanguage.sass,
  StylesheetLanguage.scss,
];

export async function getStylesheetContent(
  document: TextDocument
): Promise<string | null> {
  const content = document.getText();
  if (content.trim() === "") {
    return content;
  }
  var env = await config.getEnv();
  const extension = path.extname(document.uri.path).toLocaleLowerCase();
  output.appendLine("[SASS(stylesheet)]" + store.activeSwing!.currentUri);
  var uriPath = store.activeSwing!.currentUri;
  if (env && env.workspaceDirectory) {
    uriPath = expandAndNormalizeDir(env.workspaceDirectory, store.activeSwing!.currentUri);
    output.appendLine("[SASS(stylesheet)] NormalizedPath [" + uriPath + "]");
  }
  try {
    switch (extension) {
      case StylesheetLanguage.scss:
      case StylesheetLanguage.sass: {
        const sass = require("@abstractions/sass");
        const css = await sass.compile(
          content,
          extension === StylesheetLanguage.sass,
          uriPath
        );

        return byteArrayToString(css);
      }
      case StylesheetLanguage.less: {
        const less = require("less").default;
        const output = await less.render(content);
        return output.css;
      }
      default:
        return content;
    }
  } catch {
    return null;
  }

  function expandAndNormalizeDir(relativeDir: string, basedir: vscode.Uri): vscode.Uri {
    var retVal = relativeDir;
    if (relativeDir.startsWith("./") || relativeDir.startsWith("../")) {
      if (basedir) {
        var start = basedir.path.split("\\").join("/").substring(1);
        var rel = relativeDir.split("\\").join("/");
        if (!start.endsWith("/")) {
          start = start + "/";
        }
        retVal = path.normalize(start + rel);
      } else {
        retVal = path.resolve(relativeDir);
      }
    }
    return vscode.Uri.parse(retVal.replace("C:\\", "C%3A/").split("\\").join("/"));;
  };
}
