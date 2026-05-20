import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  useMediaQuery,
  type Theme,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppState } from "../../state/appContext";

const ITEMS_PER_PAGE = 10;

/**
 * HELPER: Resolves raw property values into display strings.
 */
const getDisplayValue = (
  feature: any,
  field: string | undefined,
  options: { resolve?: boolean; format?: string; suffix?: string },
  entities: any
) => {
  if (!field) return "";
  let rawValue = feature.properties[field] ?? feature[field];
  if (rawValue === undefined || rawValue === null) return "";

  // MapLibre stringification fix
  if (
    typeof rawValue === "string" &&
    (rawValue.startsWith("[") || rawValue.startsWith("{"))
  ) {
    try {
      rawValue = JSON.parse(rawValue);
    } catch (e) {}
  }

  let result = "";

  // DATA BLIND FORMATTING
  if (options.format === "count") {
    const count = Array.isArray(rawValue) ? rawValue.length : 0;
    result = String(count);
  } else if (options.resolve) {
    const ids = Array.isArray(rawValue) ? rawValue : [rawValue];
    const names = ids
      .map((id: string) => entities[id]?.name || id)
      .filter(Boolean);
    result = names.join(", ");
  } else {
    result = String(rawValue);
  }

  return options.suffix ? `${result} ${options.suffix}` : result;
};
/**
 * SUB-COMPONENT: LayerList
 * "blind" renderer that displays whatever array of features it is given.
 */
function LayerList({
  layer,
  features, // array of features to display (top-level or nested)
  source,
  entities,
  page,
  onPageChange,
  onSelect,
  onDrillDown,
  selectedId,
  isDrilledIn,
}: any) {
  // Pagination
  const totalPages = Math.ceil(features.length / ITEMS_PER_PAGE);
  const currentPageFeatures = features.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  // Config Resolution (uses childTableConfig if drilled in)
  const tConf =
    isDrilledIn && layer.childTableConfig
      ? layer.childTableConfig
      : layer.tableConfig || {
          primaryField: source?.mapping?.title,
          secondaryField: source?.mapping?.dateStart,
        };

  return (
    <Box>
      <List dense disablePadding>
        {currentPageFeatures.length === 0 ? (
          <Typography
            variant="caption"
            sx={{ p: 2, display: "block", opacity: 0.5 }}
          >
            No results for this time range.
          </Typography>
        ) : (
          currentPageFeatures.map((f: any) => {
            const id = String(f.id || f.properties?.id);
            const isSelected = selectedId === id;

            // Check if this feature has children based on the generic mapping
            const childKey = source?.mapping?.children || "children";
            const hasChildren = !!f.properties[childKey];

            return (
              <ListItemButton
                key={id}
                selected={isSelected}
                onClick={() => onSelect(f, tConf.templateId)}
                sx={{
                  borderLeft: isSelected
                    ? "3px solid"
                    : "3px solid transparent",
                  borderColor: "secondary.main",
                }}
              >
                <ListItemText
                  primary={getDisplayValue(
                    f,
                    tConf.primaryField,
                    {
                      resolve: tConf.resolvePrimary,
                      format: tConf.primaryFormat,
                      suffix: tConf.primarySuffix,
                    },
                    entities
                  )}
                  secondary={getDisplayValue(
                    f,
                    tConf.secondaryField,
                    {
                      resolve: tConf.resolveSecondary,
                      format: tConf.secondaryFormat,
                      suffix: tConf.secondarySuffix,
                    },
                    entities
                  )}
                  primaryTypographyProps={{
                    variant: "caption",
                    noWrap: true,
                    fontWeight: isSelected ? "bold" : "medium",
                  }}
                  secondaryTypographyProps={{
                    variant: "caption",
                    sx: { fontSize: "0.65rem", opacity: 0.6 },
                  }}
                />
                {/* only show drill-dowwn icon if not already drilled in and children exist */}
                {hasChildren && !isDrilledIn && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillDown(f);
                    }}
                    sx={{ color: "secondary.main" }}
                  >
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </ListItemButton>
            );
          })
        )}
      </List>
      {totalPages > 1 && (
        <Box
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Pagination
            count={totalPages}
            page={page + 1}
            size="small"
            onChange={(_, v) => onPageChange(v - 1)}
            siblingCount={0}
          />
        </Box>
      )}
    </Box>
  );
}

/**
 * MAIN COMPONENT: FeatureTable
 */
export function FeatureTable() {
  const { state, dispatch } = useAppState();
  const {
    processedData,
    layerConfig,
    sources,
    selectedFeature,
    selectedLayerId,
    tablePage,
    dictionaries,
    layerSubState, // record-based sub-state
  } = state;

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const handleClose = () => {
    isMobile
      ? dispatch({ type: "SET_ACTIVE_MOBILE_PANEL", payload: "none" })
      : dispatch({ type: "TOGGLE_TABLE_PANEL" });
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
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
        <Typography variant="h6">Data Exploration</Typography>
        <IconButton size="small" onClick={handleClose}>
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Box>

      {/* SCROLLABLE ACCORDION AREA */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {layerConfig.map((layer) => {
          if (!layer.visible) return null;

          const source = sources[layer.sourceId];
          const page = tablePage[layer.id] || 0;
          const dictionary =
            dictionaries[layer.dictionaryId || source?.dictionaryId || ""] ||
            {};

          // GENERIC DRILL-DOWN CHECK
          const subState = layerSubState[layer.id];
          const isDrilledIn = !!subState?.data;

          // get List Name
          let parentName = "";
          if (isDrilledIn && subState.parentId) {
            //find the parent feature in the top-level data
            const parentFeature = processedData[layer.id]?.features?.find(
              (f: any) => String(f.id || f.properties?.id) === subState.parentId
            );

            // format its name using the Data Blind helper
            if (parentFeature) {
              const tConf = layer.tableConfig || {
                primaryField: source?.mapping?.title,
              };
              parentName = getDisplayValue(
                parentFeature,
                tConf.primaryField,
                {
                  resolve: tConf.resolvePrimary,
                  format: tConf.primaryFormat,
                  suffix: tConf.primarySuffix,
                },
                dictionary
              );
            } else {
              // fallback - feature isnt found
              parentName =
                dictionary[subState.parentId]?.name || subState.parentId;
            }
          }

          // wedetermine what to show in this accordion
          const displayFeatures = isDrilledIn
            ? subState.data
            : processedData[layer.id]?.features || [];

          // SMART EXPANSION if layer is selected OR a feature from this layer is selected
          const isExpanded =
            selectedLayerId === layer.id ||
            selectedFeature?.layerId === layer.id;

          return (
            <Accordion
              key={layer.id}
              expanded={isExpanded}
              onChange={(_, isNowExpanded) => {
                if (!isNowExpanded) {
                  dispatch({ type: "SELECT_LAYER", payload: null });

                  if (selectedFeature?.layerId === layer.id) {
                    dispatch({ type: "SELECT_FEATURE", payload: null });
                  }
                } else {
                  dispatch({ type: "SELECT_LAYER", payload: layer.id });
                }
              }}
              disableGutters
              elevation={0}
              sx={{
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                bgcolor: "transparent",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ width: "100%", pr: 2 }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: "bold",
                      color: isExpanded ? "secondary.main" : "text.primary",
                    }}
                  >
                    {layer.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>
                    ({processedData[layer.id]?.features?.length || 0})
                  </Typography>
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                {/* GENERIC BACK BUTTON */}
                {isDrilledIn && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: "rgba(255, 152, 0, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({
                          type: "SET_LAYER_DRILL_DOWN",
                          payload: { layerId: layer.id, parentFeature: null },
                        });
                      }}
                    >
                      <ArrowBackIcon fontSize="inherit" />
                    </IconButton>
                    <Typography variant="caption" fontWeight="bold">
                      Sub-items {parentName ? `for ${parentName}` : ""}
                    </Typography>
                  </Box>
                )}

                <LayerList
                  layer={layer}
                  features={displayFeatures}
                  source={source}
                  entities={dictionary}
                  page={page}
                  selectedId={selectedFeature?.id}
                  isDrilledIn={isDrilledIn}
                  onPageChange={(p: number) =>
                    dispatch({
                      type: "SET_TABLE_PAGE",
                      payload: { layerId: layer.id, page: p },
                    })
                  }
                  onSelect={(f: any, tid: string) => {
                    let coords = [0, 0];
                    if (f.geometry?.type === "Point")
                      coords = f.geometry.coordinates;
                    else if (f.geometry?.type === "LineString")
                      coords = f.geometry.coordinates[0];

                    dispatch({
                      type: "SELECT_FEATURE",
                      payload: {
                        id: String(f.id || f.properties?.id),
                        layerId: layer.id,
                        templateId: tid,
                        longitude: coords[0],
                        latitude: coords[1],
                      },
                    });
                  }}
                  onDrillDown={(f: any) =>
                    dispatch({
                      type: "SET_LAYER_DRILL_DOWN",
                      payload: { layerId: layer.id, parentFeature: f },
                    })
                  }
                />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
}
