import { useEffect } from "react";
import {
  Box,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppState } from "../../../state/appContext";
import { extractGenericPopupData } from "../../../utils/popupUtils";
import { popupTemplates } from "../../../config/templates";
import { customPopupComponents } from "../../../registries/componentRegistry";

export default function FeatureDetailPanel() {
  const { state, dispatch } = useAppState();
  const { processedData, layerConfig, dictionaries, sources, selectedFeature } =
    state;

  // 1. Empty State
  if (!selectedFeature) {
    return (
      <Box sx={{ p: 3, textAlign: "center", opacity: 0.6 }}>
        <Typography variant="body2" fontStyle="italic">
          Select a feature on the map or in the data table to view details here.
        </Typography>
      </Box>
    );
  }

  // 2. Config Resolution
  const layer = layerConfig.find((l) => l.id === selectedFeature.layerId);
  if (!layer) return null;

  const activeTemplateId = selectedFeature.templateId || layer.templateId;
  const template = popupTemplates[activeTemplateId];

  if (!template) {
    return <Box sx={{ p: 2 }}>Template {activeTemplateId} not found</Box>;
  }

  // 3. Feature Lookup
  const currentLayerData = processedData[selectedFeature.layerId];
  let currentFeature = currentLayerData?.features.find(
    (f: any) => String(f.id) === String(selectedFeature.id)
  );

  // Search inside aggregated "children" if not found at top level
  if (!currentFeature && currentLayerData) {
    for (const f of currentLayerData.features) {
      if (f.properties?.children) {
        const child = f.properties.children.find(
          (c: any) =>
            String(c.id || c.properties?.id) === String(selectedFeature.id)
        );
        if (child) {
          currentFeature = child;
          break;
        }
      }
    }
  }

  // Auto-close logic if feature disappears (e.g., filtered out)
  useEffect(() => {
    if (
      currentLayerData &&
      currentLayerData.features.length > 0 &&
      !currentFeature
    ) {
      dispatch({ type: "SELECT_FEATURE", payload: null });
    }
  }, [currentFeature, currentLayerData, dispatch]);

  if (!currentFeature) return null;

  // 4. Dictionary Resolution
  const sourceConfig = sources[layer.sourceId];
  const dictionaryId = layer.dictionaryId || sourceConfig?.dictionaryId;
  const relevantDictionary =
    dictionaryId && dictionaries[dictionaryId]
      ? dictionaries[dictionaryId]
      : {};

  // 5. Data Extraction
  const popupData = extractGenericPopupData(
    currentFeature,
    template,
    relevantDictionary
  );
  const { fields, url } = popupData;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* HEADER: Title & Close Button */}
      <Box
        sx={{
          p: 2,
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" color="secondary" noWrap>
          Detail
        </Typography>
        <IconButton
          size="small"
          onClick={() => dispatch({ type: "SELECT_FEATURE", payload: null })}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* SCROLLABLE CONTENT */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {fields.map((field, index) => {
          // TYPE: CUSTOM
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

          // TYPE: LINK-BUTTON
          if (field.type === "link-button") {
            return (
              <Button
                key={index}
                component="a"
                variant="contained"
                color="secondary"
                fullWidth
                href={field.url || "#"}
                target="_blank"
                rel="noopener"
                sx={{ mt: 1, mb: 2, fontWeight: "bold" }}
              >
                {field.label}
              </Button>
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
                  sx={{ bgcolor: "rgba(0,0,0,0.2)", borderRadius: 1 }}
                >
                  {field.value.map((child: any, i: number) => {
                    const primaryLabel =
                      child.properties[labelKey] || "Unknown Item";
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
                                  parentFeature: currentFeature,
                                  templateId: meta.detailTemplateId,
                                  layerId: selectedFeature.layerId,
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

          // TYPE: TAGS
          if (field.type === "tags" && Array.isArray(field.value)) {
            return (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  {field.label} ({field.value.length})
                </Typography>
                <Box
                  sx={{
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
            const rawText = String(field.value);
            return (
              <Box
                key={index}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  p: 1.5,
                  borderRadius: 1,
                  mb: 2,
                  fontStyle: "italic",
                  borderLeft: "3px solid",
                  borderColor: "secondary.main",
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ lineHeight: 1.5 }}
                >
                  {rawText.split(/<lb\s*\/?>/i).map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </Typography>
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
                <List dense disablePadding>
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
    </Box>
  );
}
