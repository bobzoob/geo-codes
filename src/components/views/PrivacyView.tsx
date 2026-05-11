import { Box, Container, Typography, Button, Paper, Link } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppState } from "../../state/appContext";
import ReactMarkdown from "react-markdown";

const privacyMarkdown = `
## Responsible Party

Responsible for collection, processing, and use of your personal data:

**Author Name**  
**Author Street 1**  
**55122 Place**  
**Germany**

---

## Data Subject Rights

You have the right to request, free of charge, information about the personal data stored by us. You also have the right to request the correction, restriction, or deletion of your personal data.

Restriction or deletion may not be possible where legal obligations require continued storage of the data.

Please contact our data protection officer at:

**privacy@this-site.app**

---

## Collection of General Information

Hosting of this website is provided by Vercel Inc. When accessing this website, technical connection data (e.g. IP address, browser information, timestamps) may be processed in server log files for security and operational purposes.  

Log files are general in nature and do not allow conclusions to be drawn about your identity. 

The following types of data may be collected:

- Browser type and browser version
- Operating system used
- Visited pages and content
- Amount of transmitted data
- Referring page (Referrer URL)
- Date and time of access
- Anonymized IP address

---

## Cookies

This website does not use cookies.
`;

export default function PrivacyView() {
  const { dispatch } = useAppState();

  return (
    <Box
      sx={{ height: "100%", overflowY: "auto", bgcolor: "background.default" }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>

        <Paper sx={{ p: 4, bgcolor: "background.paper" }}>
          {/* 2. Render the Markdown and map tags to MUI components */}
          <ReactMarkdown
            components={{
              // Map # to Typography h4
              h1: ({ node, ...props }) => (
                <Typography
                  variant="h4"
                  color="secondary"
                  gutterBottom
                  {...props}
                />
              ),
              // Map ## to Typography h5
              h2: ({ node, ...props }) => (
                <Typography
                  variant="h5"
                  color="secondary"
                  sx={{ mt: 4, mb: 2 }}
                  {...props}
                />
              ),
              // Map paragraphs to Typography body1
              p: ({ node, ...props }) => (
                <Typography
                  variant="body2"
                  paragraph
                  sx={{ color: "text.secondary" }}
                  {...props}
                />
              ),
              // Map links to MUI Link
              a: ({ node, ...props }) => (
                <Link
                  color="secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              // Map list items
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
            {privacyMarkdown}
          </ReactMarkdown>
        </Paper>
      </Container>
    </Box>
  );
}
