import {
  Box,
  Typography,
  Link,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useAppState } from "../../../state/appContext";
import { extractGenericPopupData } from "../../../utils/popupUtils";
import { popupTemplates } from "../../../config/templates";
import { customPopupComponents } from "../../../registries/componentRegistry";

export default function FeatureDetailPanel() {
  const { state, dispatch } = useAppState();
  const { processedData, layerConfig, dictionaries, sources, selectedFeature } =
    state;

  const handleClose = () => {
    dispatch({ type: "SELECT_FEATURE", payload: null });
  };

  // 1. Resolve Data (if feature selected)
  const layer = selectedFeature
    ? layerConfig.find((l) => l.id === selectedFeature.layerId)
    : null;
  const currentLayerData = selectedFeature
    ? processedData[selectedFeature.layerId]
    : null;

  let currentFeature = null;
  if (selectedFeature && currentLayerData) {
    currentFeature = currentLayerData.features.find(
      (f: any) => String(f.id) === String(selectedFeature.id)
    );
    if (!currentFeature) {
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
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* UNIVERSAL HEADER */}
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
          Details
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Box>

      {/* CONTENT AREA */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {!selectedFeature || !currentFeature ? (
          <Box sx={{ p: 4, textAlign: "center", opacity: 0.6 }}>
            <Typography variant="body2" fontStyle="italic">
              Select a feature on the map or in the data table to view details
              here.
            </Typography>
          </Box>
        ) : (
          (() => {
            const activeTemplateId =
              selectedFeature.templateId || layer?.templateId;
            const template = activeTemplateId
              ? popupTemplates[activeTemplateId]
              : null;
            if (!template)
              return (
                <Typography variant="caption">Template not found</Typography>
              );

            const sourceConfig = layer ? sources[layer.sourceId] : null;
            const dictionaryId =
              layer?.dictionaryId || sourceConfig?.dictionaryId;
            const relevantDictionary = dictionaryId
              ? dictionaries[dictionaryId]
              : {};
            const popupData = extractGenericPopupData(
              currentFeature,
              template,
              relevantDictionary
            );

            return (
              <>
                {popupData.fields.map((field, index) => {
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
                  if (field.type === "header")
                    return (
                      <Typography
                        key={index}
                        variant="h6"
                        gutterBottom
                        sx={{
                          borderBottom: 1,
                          borderColor: "divider",
                          pb: 1,
                          mb: 2,
                        }}
                      >
                        {field.value}
                      </Typography>
                    );
                  // image
                  if (field.type === "image") {
                    if (!field.value) return null; // skip if no image URL is provided in the data
                    return (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box
                          component="img"
                          src={String(field.value)}
                          alt={field.label || "Feature Image"}
                          sx={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "cover",
                            borderRadius: 1,
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />
                        {(field.meta as any)?.caption && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{
                              mt: 0.5,
                              fontStyle: "italic",
                              textAlign: "right",
                            }}
                          >
                            {(field.meta as any).caption}
                          </Typography>
                        )}
                      </Box>
                    );
                  }
                  if (field.type === "text")
                    return (
                      <Typography key={index} variant="body2" gutterBottom>
                        <Box
                          component="span"
                          sx={{ color: "text.secondary", mr: 1 }}
                        >
                          {field.label}:
                        </Box>
                        {field.url ? (
                          <Link
                            href={field.url}
                            target="_blank"
                            color="secondary"
                          >
                            {field.value}
                          </Link>
                        ) : (
                          field.value
                        )}
                      </Typography>
                    );
                  if (field.type === "link-button")
                    return (
                      <Button
                        key={index}
                        component="a"
                        variant="contained"
                        color="secondary"
                        fullWidth
                        href={field.url || "#"}
                        target="_blank"
                        sx={{ mt: 1, mb: 2 }}
                      >
                        {field.label}
                      </Button>
                    );
                  if (field.type === "tags" && Array.isArray(field.value))
                    return (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
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
                          {field.value.map((tag: any, i: number) => (
                            <Chip
                              key={i}
                              label={tag.name || tag}
                              size="small"
                              component={tag.url ? "a" : "div"}
                              href={tag.url}
                              target="_blank"
                              clickable={!!tag.url}
                            />
                          ))}
                        </Box>
                      </Box>
                    );
                  if (field.type === "long-text") {
                    if (!field.value) return null; // Safety check to prevent rendering "undefined"

                    const rawText = String(field.value);

                    // 20-word preview logic
                    const words = rawText.split(/\s+/);
                    const isTruncated = words.length > 20;
                    const previewText =
                      words.slice(0, 20).join(" ") + (isTruncated ? "..." : "");

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
                          maxHeight: "150px",
                          overflowY: "auto",
                        }}
                      >
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{ lineHeight: 1.5 }}
                        >
                          {/* transform <lb/> tags into line breaks within the preview */}
                          {previewText
                            .split(/<lb\s*\/?>/i)
                            .map((line, i, arr) => (
                              <span key={i}>
                                {line}
                                {i < arr.length - 1 && <br />}
                              </span>
                            ))}
                        </Typography>
                      </Box>
                    );
                  }

                  // RENDER STANDARD LISTS
                  if (field.type === "list" && Array.isArray(field.value)) {
                    return (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          {field.label}
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {field.value.map((item: any, i: number) => (
                            <Chip
                              key={i}
                              label={item.name || item}
                              size="small"
                              component={item.url ? "a" : "div"}
                              href={item.url}
                              target="_blank"
                              clickable={!!item.url}
                            />
                          ))}
                        </Box>
                      </Box>
                    );
                  }

                  // RENDER TIMED-LISTS (activity_log in demo version)
                  if (
                    field.type === "timed-list" &&
                    Array.isArray(field.value)
                  ) {
                    return (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          {field.label}
                        </Typography>
                        <List dense disablePadding>
                          {field.value.map((item: any, i: number) => (
                            <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                              <ListItemText
                                primary={item.label}
                                secondary={item.subLabel}
                                primaryTypographyProps={{ variant: "body2" }}
                                secondaryTypographyProps={{
                                  variant: "caption",
                                  color: "secondary.main",
                                  fontWeight: "bold",
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    );
                  }

                  return null;
                })}

                {popupData.url && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 1,
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      textAlign: "right",
                    }}
                  >
                    <Link
                      href={popupData.url}
                      target="_blank"
                      variant="caption"
                      color="secondary"
                    >
                      View Source &rarr;
                    </Link>
                  </Box>
                )}
              </>
            );
          })()
        )}
      </Box>
    </Box>
  );
}
