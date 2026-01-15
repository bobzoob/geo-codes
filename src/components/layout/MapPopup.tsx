import { Popup } from "react-map-gl/maplibre";
import {
  Box,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import type { SelectedFeature } from "../../hooks/useMapInteraction";

interface MapPopupProps {
  feature: SelectedFeature;
  onClose: () => void;
}

export function MapPopup({ feature, onClose }: MapPopupProps) {
  // feature.data is now GenericPopupData
  const { fields, url } = feature.data;

  return (
    <Popup
      longitude={feature.longitude}
      latitude={feature.latitude}
      anchor="bottom"
      onClose={onClose}
      maxWidth="320px"
      style={{ zIndex: 1000 }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 2,
          borderRadius: 1,
          minWidth: "250px",
          color: "text.primary",
        }}
      >
        {fields.map((field, index) => {
          // --- TYPE: HEADER ---
          if (field.type === "header") {
            return (
              <Typography
                key={index}
                variant="h6"
                gutterBottom
                sx={{ borderBottom: 1, borderColor: "divider" }}
              >
                {field.value}
              </Typography>
            );
          }

          // --- TYPE: TEXT (Simple) ---
          if (field.type === "text") {
            return (
              <Typography key={index} variant="body2" gutterBottom>
                <strong>{field.label}:</strong> {field.value}
              </Typography>
            );
          }

          // --- TYPE: TAGS (Mentions) ---
          if (field.type === "tags" && Array.isArray(field.value)) {
            return (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {field.label}:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {field.value.map((tag: string, i: number) => (
                    <Chip
                      key={i}
                      label={tag}
                      size="small"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  ))}
                </Box>
              </Box>
            );
          }

          // --- TYPE: LONG TEXT (Auto-Scroll Logic) ---
          if (field.type === "long-text") {
            const isLong = field.value.length > 300;
            return (
              <Box
                key={index}
                sx={{
                  bgcolor: "rgba(0,0,0,0.2)",
                  p: 1,
                  borderRadius: 1,
                  mb: 1,
                  fontStyle: "italic",
                  maxHeight: isLong ? "150px" : "auto",
                  overflowY: isLong ? "auto" : "visible",
                }}
              >
                <Typography variant="body2" fontSize="0.85rem">
                  {field.value}
                </Typography>
              </Box>
            );
          }

          // --- TYPE: LIST & TIMED-LIST (Auto-Scroll Logic) ---
          if (field.type === "list" || field.type === "timed-list") {
            const items = field.value;
            const isLongList = items.length > 5; // PERSISTENT LOGIC: > 5 items = scroll

            return (
              <Box key={index} sx={{ mt: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="secondary">
                  {field.label} ({items.length})
                </Typography>
                <List
                  dense
                  disablePadding
                  sx={{
                    maxHeight: isLongList ? "150px" : "auto",
                    overflowY: isLongList ? "auto" : "visible",
                    bgcolor: isLongList ? "rgba(0,0,0,0.1)" : "transparent",
                    borderRadius: 1,
                  }}
                >
                  {items.map((item: any, i: number) => (
                    <ListItem
                      key={i}
                      divider={i < items.length - 1}
                      sx={{ py: 0.5 }}
                    >
                      {field.type === "timed-list" ? (
                        <ListItemText
                          primary={item.label}
                          secondary={item.subLabel ? `(${item.subLabel})` : ""}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: "bold",
                          }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                      ) : (
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            );
          }
          return null;
        })}

        {/* Footer Link */}
        {url && (
          <Box sx={{ mt: 1, textAlign: "right" }}>
            <Link
              href={url}
              target="_blank"
              variant="caption"
              color="secondary"
            >
              View Source &rarr;
            </Link>
          </Box>
        )}
      </Box>
    </Popup>
  );
}
