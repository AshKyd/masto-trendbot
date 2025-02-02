export function isUspol({ content = "", media_attachments = [] }) {
  const rejectedKeywords = process.env.REJECTED_KEYWORDS.split(",");
  const lcContent = content.toLowerCase();
  const isKeywordMatch = rejectedKeywords.some(
    (keyword) =>
      lcContent.includes(keyword) ||
      media_attachments.some((attachment) =>
        attachment.description?.toLowerCase()?.includes(keyword)
      )
  );
  return isKeywordMatch;
}
