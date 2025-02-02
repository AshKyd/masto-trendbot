import striptags from "striptags";

function doesKeywordMatch(
  keywords,
  { content, media_attachments },
  isLowercase
) {
  const lcContent = isLowercase ? content.toLowerCase() : content;
  return keywords.find((keyword) => {
    const isMatched =
      lcContent.includes(keyword) ||
      media_attachments.some((attachment) =>
        attachment.description?.[
          isLowercase ? "toLowerCase" : "trim"
        ]()?.includes(keyword)
      );
    return isMatched;
  });
}

export function isUspol(data) {
  const logLine = `“${striptags(data.content).slice(0, 50)}…” - ${data.url}`;

  // Override keywords allow posts that otherwise might have been disallowed
  const overriddenKeyword = doesKeywordMatch(
    process.env.OVERRIDE_KEYWORDS.split(","),
    data,
    true
  );
  if (overriddenKeyword) {
    console.log(`Allowed post with ‘${overriddenKeyword}’ - ${logLine}`);
    return true;
  }

  // Rejected keywords are matched case insensitive
  const rejectedKeyword = doesKeywordMatch(
    process.env.REJECTED_KEYWORDS.split(","),
    data,
    true
  );
  if (rejectedKeyword) {
    console.log(
      `Filtered post with ‘${rejectedKeyword}’ case-insensitive - ${logLine}`
    );
    return true;
  }

  // These keywords are matched case sensitive
  const rejectedKeywordSensitive = doesKeywordMatch(
    process.env.REJECTED_KEYWORDS_CASE_SENSITIVE.split(","),
    data,
    false
  );
  if (rejectedKeywordSensitive) {
    console.log(
      `Filtered post with ‘${rejectedKeywordSensitive}’ case-sensitive - ${logLine}`
    );
    return true;
  }

  return false;
}
