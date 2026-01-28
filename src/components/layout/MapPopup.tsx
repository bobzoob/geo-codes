import { Popup } from "react-map-gl/maplibre";
import {
  Box,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
} from "@mui/material";
import type { SelectedFeature } from "../../hooks/useMapInteraction";
import { useAppState } from "../../state/appContext";
import { extractGenericPopupData } from "../../utils/popupUtils";
import { useEffect } from "react";

interface MapPopupProps {
  feature: SelectedFeature;
  onClose: () => void;
}

export function MapPopup({ feature, onClose }: MapPopupProps) {
  const { state } = useAppState();
  const { processedData, layerConfig, entities } = state;

  // LIVE LOOKUP
  const currentLayerData = processedData[feature.layerId];
  const currentFeature = currentLayerData?.features.find(
    (f: any) => String(f.id) === String(feature.featureId)
  );

  // AUTO CLOSE so the popup will close when filter change
  useEffect(() => {
    if (
      currentLayerData &&
      currentLayerData.features.length > 0 &&
      !currentFeature
    ) {
      onClose();
    }
  }, [currentFeature, currentLayerData, onClose]);

  if (!currentFeature) return null;

  // EXTRACT DATA
  const config = layerConfig.find((l) => l.id === feature.layerId);
  if (!config) return null;

  const popupData = extractGenericPopupData(
    currentFeature,
    config.popupConfig,
    entities
  );
  const { fields, url } = popupData;

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
          p: 2,

          minWidth: "250px",
        }}
      >
        {fields.map((field, index) => {
          // TYPE: HEADER
          if (field.type === "header") {
            return (
              <Typography
                key={index}
                variant="h6"
                gutterBottom
                sx={{ borderBottom: 1, borderColor: "divider", pb: 1, mb: 2 }}
              >
                {field.value}
              </Typography>
            );
          }

          // TYPE: TEXT
          if (field.type === "text") {
            return (
              <Typography key={index} variant="body2" gutterBottom>
                <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                  {field.label}:
                </Box>
                {field.url ? (
                  <Link
                    href={field.url}
                    target="_blank"
                    rel="noopener"
                    color="secondary"
                    underline="hover"
                  >
                    {field.value}
                  </Link>
                ) : (
                  field.value
                )}
              </Typography>
            );
          }

          // TYPE: FEATURE-LIST (reactive list)
          if (field.type === "feature-list" && Array.isArray(field.value)) {
            const meta = field.meta || {};
            const listLabelField = meta.listLabelField || "title";

            return (
              <Box key={index} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {field.label} ({field.value.length}):
                </Typography>
                <List
                  dense
                  sx={{
                    maxHeight: 200,
                    overflow: "auto",
                    bgcolor: "rgba(0,0,0,0.2)",
                    borderRadius: 1,
                  }}
                >
                  {field.value.map((child: any, i: number) => {
                    const label = child.properties[listLabelField] || "Unknown";
                    const senderId = child.properties.sender_ids?.[0];
                    const senderName = senderId
                      ? entities[senderId]?.name || senderId
                      : "";

                    return (
                      <ListItem key={i} divider disablePadding>
                        <ListItemButton
                          onClick={() => {
                            // Dispatch event to trigger drill-down in useMapInteraction
                            window.dispatchEvent(
                              new CustomEvent("app:select-feature", {
                                detail: {
                                  feature: child,
                                  layerId: meta.detailLayerId,
                                },
                              })
                            );
                          }}
                        >
                          <ListItemText
                            primary={label}
                            secondary={senderName}
                            primaryTypographyProps={{
                              variant: "body2",
                              fontWeight: 500,
                            }}
                            secondaryTypographyProps={{
                              variant: "caption",
                              sx: { opacity: 0.7 },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            );
          }

          // TYPE: TAGS
          if (field.type === "tags" && Array.isArray(field.value)) {
            const isMentionField =
              field.label && field.label.toLowerCase().includes("mention");

            // the chip:
            const tagContainer = (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {field.value.map((tag: any, i: number) => {
                  const label =
                    typeof tag === "object" && tag.name ? tag.name : tag;
                  const tagUrl =
                    typeof tag === "object" && tag.url ? tag.url : null;
                  return (
                    <Chip
                      key={i}
                      label={label}
                      size="small"
                      component={tagUrl ? "a" : "div"}
                      href={tagUrl}
                      target="_blank"
                      clickable={!!tagUrl}
                    />
                  );
                })}
              </Box>
            );

            return (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  {field.label} ({field.value.length})
                </Typography>

                {isMentionField ? (
                  // if mention field, we wrap it in a scrollable box
                  <Box
                    sx={{
                      maxHeight: "110px",
                      overflowY: "auto",
                      p: 1,
                      bgcolor: "rgba(0,0,0,0.2)",
                      borderRadius: 1,
                    }}
                  >
                    {tagContainer}
                  </Box>
                ) : (
                  // otherwise we render the tags normally
                  tagContainer
                )}
              </Box>
            );
          }

          // TYPE: LONG TEXT
          if (field.type === "long-text") {
            const isLong = field.value.length > 300;
            return (
              <Box
                key={index}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  p: 1.5,
                  borderRadius: 1,
                  mb: 2,
                  fontStyle: "italic",
                  maxHeight: isLong ? "150px" : "auto",
                  overflowY: isLong ? "auto" : "visible",
                  borderLeft: "3px solid #ff9800",
                }}
              >
                <Typography variant="body2">{field.value}</Typography>
              </Box>
            );
          }

          //  TYPE: LIST & TIMED-LIST
          if (field.type === "list" || field.type === "timed-list") {
            return (
              <Box key={index} sx={{ mt: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="secondary">
                  {field.label} ({field.value.length})
                </Typography>
                <List
                  dense
                  disablePadding
                  sx={{ maxHeight: 150, overflow: "auto" }}
                >
                  {field.value.map((item: any, i: number) => {
                    // Determine Label and SubLabel based on type
                    let primaryText = item;
                    let secondaryText = "";
                    let itemUrl = null;

                    if (field.type === "timed-list") {
                      // Timed list is always { label, subLabel }
                      primaryText = item.label;
                      secondaryText = item.subLabel;
                    } else if (
                      typeof item === "object" &&
                      item !== null &&
                      "name" in item
                    ) {
                      // Standard list with ResolvedEntity { name, url }
                      primaryText = item.name;
                      itemUrl = item.url;
                    }

                    return (
                      <ListItem key={i} divider sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            itemUrl ? (
                              <Link
                                href={itemUrl}
                                target="_blank"
                                rel="noopener"
                                color="inherit"
                                underline="hover"
                              >
                                {primaryText}
                              </Link>
                            ) : (
                              primaryText
                            )
                          }
                          secondary={secondaryText}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            );
          }
          return null;
        })}

        {/* Footer Link */}
        {url && (
          <Box
            sx={{
              mt: 2,
              pt: 1,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              textAlign: "right",
            }}
          >
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
