import { Typography, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface CorrespondenceHeaderProps {
  feature: any;
  entities: Record<string, any>;
}

export function CorrespondenceHeader({
  feature,
  entities = {},
}: CorrespondenceHeaderProps) {
  const props = feature.properties;

  // Helper to resolve IDs to mmes from dict
  const resolveNames = (ids: any) => {
    if (!ids) return "Unknown";
    const idList = Array.isArray(ids) ? ids : [ids];
    return idList.map((id) => entities[id]?.name || id).join(", ");
  };

  const senders = resolveNames(props.sender_ids);
  const recipients = resolveNames(props.recipient_ids);

  return (
    <Box sx={{ mb: 2, borderBottom: 1, borderColor: "divider", pb: 1 }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ fontSize: "0.7rem", textTransform: "uppercase" }}
      >
        {/*this is where a title could go*/}
      </Typography>
      <Box
        sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}
      >
        <Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: "bold" }}>
          {senders}
        </Typography>
        <ArrowForwardIcon sx={{ fontSize: 16, color: "secondary.main" }} />
        <Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: "bold" }}>
          {recipients}
        </Typography>
      </Box>
    </Box>
  );
}
