import ReactMarkdown from "react-markdown";
import { Typography, Link } from "@mui/material";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <Typography variant="h4" color="secondary" gutterBottom {...props} />
        ),
        h2: ({ node, ...props }) => (
          <Typography
            variant="h5"
            color="secondary"
            sx={{ mt: 4, mb: 2 }}
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <Typography
            variant="body2"
            paragraph
            sx={{ color: "text.secondary" }}
            {...props}
          />
        ),
        a: ({ node, ...props }) => (
          <Link
            color="secondary"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <Typography
            component="li"
            variant="body2"
            sx={{ color: "text.secondary", ml: 2, mb: 1 }}
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
