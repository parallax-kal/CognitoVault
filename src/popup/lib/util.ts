export const sanitizeKey = (key: string) => {
  return key.replace(/[.#$/[\]]/g, (match) => {
    switch (match) {
      case ".":
        return "_DOT_";
      case "#":
        return "_HASH_";
      case "$":
        return "_DOLLAR_";
      case "/":
        return "_SLASH_";
      case "[":
        return "_LEFT_BRACKET_";
      case "]":
        return "_RIGHT_BRACKET_";
      default:
        return match;
    }
  });
};

export const unsanitizeKey = (key: string) => {
  return key.replace(
    /_DOT_|_HASH_|_DOLLAR_|_SLASH_|_LEFT_BRACKET_|_RIGHT_BRACKET_/g,
    (match) => {
      switch (match) {
        case "_DOT_":
          return ".";
        case "_HASH_":
          return "#";
        case "_DOLLAR_":
          return "$";
        case "_SLASH_":
          return "/";
        case "_LEFT_BRACKET_":
          return "[";
        case "_RIGHT_BRACKET_":
          return "]";
        default:
          return match;
      }
    }
  );
};