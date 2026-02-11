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
import { popupTemplates } from "../../config/templates";
import { customPopupComponents } from "../../registries/componentRegistry";

interface MapPopupProps {
  feature: SelectedFeature;
  onClose: () => void;
}

export function MapPopup({ feature, onClose }: MapPopupProps) {
  const { state } = useAppState();
  const { processedData, layerConfig, dictionaries, sources } = state;

  // CONFIG RESOLUTION
  const layer = layerConfig.find((l) => l.id === feature.layerId);
  if (!layer) return null;

  // use templateId from drill-down state if it exists, otherwise use layer default
  const activeTemplateId = feature.templateId || layer.templateId;
  const template = popupTemplates[activeTemplateId];

  if (!template) {
    console.warn(`Template ${activeTemplateId} not found`);
    return null;
  }

  // FEATURE LOOKUP
  const currentLayerData = processedData[feature.layerId];
  let currentFeature = currentLayerData?.features.find(
    (f: any) => String(f.id) === String(feature.featureId)
  );

  // if not found at top level, we search inside aggregated "children"
  if (!currentFeature && currentLayerData) {
    for (const f of currentLayerData.features) {
      if (f.properties?.children) {
        const child = f.properties.children.find(
          (c: any) =>
            String(c.id || c.properties?.id) === String(feature.featureId)
        );
        if (child) {
          currentFeature = child;
          break;
        }
      }
    }
  }

  // Auto-close
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

  // DICTIONARY RESOLUTION
  const sourceConfig = sources[layer.sourceId];
  const dictionaryId = layer.dictionaryId || sourceConfig?.dictionaryId;
  const relevantDictionary =
    dictionaryId && dictionaries[dictionaryId]
      ? dictionaries[dictionaryId]
      : {};

  // DATA EXTRACTION
  const popupData = extractGenericPopupData(
    currentFeature,
    template,
    relevantDictionary
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
      <Box sx={{ p: 2, minWidth: "250px" }}>
        {fields.map((field, index) => {
          //  TYPE: CUSTOM
          if (field.type === "custom" && field.componentId) {
            const CustomComp = customPopupComponents[field.componentId];
            return CustomComp ? (
              <CustomComp
                key={index}
                feature={currentFeature}
                entities={relevantDictionary}
                params={field.params}
              />
            ) : null;
          }

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

          // TYPE: FEATURE-LIST
          if (field.type === "feature-list" && Array.isArray(field.value)) {
            const meta = field.meta || {};
            const labelKey = meta.listLabelField || "title";
            const secondaryKey = meta.listSecondaryField;

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
                    // resolve primary label
                    const primaryLabel =
                      child.properties[labelKey] || "Unknown Item";

                    // resolve secondary label
                    let secondaryLabel = "";
                    if (secondaryKey) {
                      const rawVal = child.properties[secondaryKey];
                      if (Array.isArray(rawVal)) {
                        secondaryLabel = rawVal
                          .map((id) => relevantDictionary[id]?.name || id)
                          .join(", ");
                      } else if (rawVal) {
                        secondaryLabel =
                          relevantDictionary[rawVal]?.name || String(rawVal);
                      }
                    }

                    return (
                      <ListItem key={i} divider disablePadding>
                        <ListItemButton
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("app:select-feature", {
                                detail: {
                                  feature: child,
                                  templateId: meta.detailTemplateId,
                                  layerId: feature.layerId,
                                },
                              })
                            );
                          }}
                        >
                          <ListItemText
                            primary={primaryLabel}
                            secondary={secondaryLabel}
                            primaryTypographyProps={{
                              variant: "body2",
                              fontWeight: 500,
                            }}
                            secondaryTypographyProps={{
                              variant: "caption",
                              sx: { opacity: 0.7, fontStyle: "italic" },
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

          //TYPE: TAGS
          if (field.type === "tags" && Array.isArray(field.value)) {
            return (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  {field.label} ({field.value.length})
                </Typography>
                <Box
                  sx={{
                    maxHeight: field.value.length > 5 ? "110px" : "auto",
                    overflowY: "auto",
                    p: 1,
                    bgcolor: "rgba(0,0,0,0.1)",
                    borderRadius: 1,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                  }}
                >
                  {field.value.map((tag: any, i: number) => {
                    const label = typeof tag === "object" ? tag.name : tag;
                    const tagUrl = typeof tag === "object" ? tag.url : null;
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
              </Box>
            );
          }

          // TYPE: LONG TEXT
          if (field.type === "long-text") {
            return (
              <Box
                key={index}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  p: 1.5,
                  borderRadius: 1,
                  mb: 2,
                  fontStyle: "italic",
                  maxHeight: "150px",
                  overflowY: "auto",
                  borderLeft: "3px solid",
                  borderColor: "secondary.main",
                }}
              >
                <Typography variant="body2">{field.value}</Typography>
              </Box>
            );
          }

          // TYPE: LIST & TIMED-LIST
          if (field.type === "list" || field.type === "timed-list") {
            return (
              <Box key={index} sx={{ mt: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="secondary">
                  {field.label}
                </Typography>
                <List
                  dense
                  disablePadding
                  sx={{ maxHeight: 150, overflow: "auto" }}
                >
                  {field.value.map((item: any, i: number) => {
                    const primaryText =
                      field.type === "timed-list"
                        ? item.label
                        : item.name || item;
                    const secondaryText =
                      field.type === "timed-list" ? item.subLabel : "";
                    const itemUrl = item.url || null;
                    return (
                      <ListItem key={i} divider sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            itemUrl ? (
                              <Link
                                href={itemUrl}
                                target="_blank"
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
