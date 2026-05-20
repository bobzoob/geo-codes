import MarkdownRenderer from "./MarkdownRenderer";
import { StaticContentView } from "./StaticContentView";

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
  return (
    <StaticContentView title="Privacy Protection">
      <MarkdownRenderer content={privacyMarkdown} />
    </StaticContentView>
  );
}
