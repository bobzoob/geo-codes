import { useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Pagination,
  Stack,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorageIcon from "@mui/icons-material/Storage";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAppState } from "../../state/appContext";

const ITEMS_PER_PAGE = 50;

/**
 * HELPER: Resolves raw property values into display strings.
 * Handles dictionary lookups for GND IDs.
 */
const getDisplayValue = (
  feature: any,
  field: string | undefined,
  resolve: boolean | undefined,
  entities: any
) => {
  if (!field) return "";
  const rawValue = feature.properties[field] ?? feature[field];
  if (rawValue === undefined || rawValue === null) return "";

  if (resolve) {
    const ids = Array.isArray(rawValue) ? rawValue : [rawValue];
    const names = ids
      .map((id: string) => entities[id]?.name || id)
      .filter(Boolean);
    return names.join(", ");
  }

  return String(rawValue);
};

export function FeatureTable() {
  const { state, dispatch } = useAppState();
  const {
    processedData,
    selectedLayerId,
    layerConfig,
    sources,
    selectedFeature,
    isTableLoaded,
    tablePage,
    drilledDownFeature, // The "Parent" hub we are currently inspecting
    dictionaries,
  } = state;

  // 1. RESOLVE CONFIG & DATA
  const layer = layerConfig.find((l) => l.id === selectedLayerId);
  const data = selectedLayerId ? processedData[selectedLayerId] : null;
  const source = layer ? sources[layer.sourceId] : null;

  // 2. DETERMINE DATA SOURCE (Layer vs. Drill-down Children)
  const baseFeatures = useMemo(() => {
    if (drilledDownFeature?.properties?.children) {
      return drilledDownFeature.properties.children;
    }
    return data?.features || [];
  }, [data, drilledDownFeature]);

  // 3. PAGINATION LOGIC
  const totalPages = Math.ceil(baseFeatures.length / ITEMS_PER_PAGE);

  const currentPageFeatures = useMemo(() => {
    const start = tablePage * ITEMS_PER_PAGE;
    return baseFeatures.slice(start, start + ITEMS_PER_PAGE);
  }, [baseFeatures, tablePage]);

  // 4. SYNC: Jump to page if feature is selected on map
  useEffect(() => {
    if (selectedFeature?.id && isTableLoaded) {
      const index = baseFeatures.findIndex(
        (f: any) => String(f.id || f.properties?.id) === selectedFeature.id
      );
      if (index !== -1) {
        const targetPage = Math.floor(index / ITEMS_PER_PAGE);
        if (targetPage !== tablePage) {
          dispatch({ type: "SET_TABLE_PAGE", payload: targetPage });
        }
      }
    }
  }, [selectedFeature?.id, isTableLoaded, baseFeatures, dispatch, tablePage]);

  // 5. GATEKEEPER (Performance)
  if (!isTableLoaded) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <StorageIcon sx={{ fontSize: 40, mb: 1, opacity: 0.2 }} />
        <Typography variant="caption" gutterBottom>
          {baseFeatures.length} features available
        </Typography>
        <Button
          size="small"
          variant="contained"
          onClick={() => dispatch({ type: "SET_TABLE_LOADED", payload: true })}
        >
          Load Data Table
        </Button>
      </Box>
    );
  }

  if (!layer || !source) return null;

  // Resolve Dictionary
  const dictionaryId = layer.dictionaryId || source.dictionaryId;
  const entities = dictionaryId ? dictionaries[dictionaryId] : {};

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER: Navigation & Info */}
      <Box sx={{ p: 1, bgcolor: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
        {drilledDownFeature ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              size="small"
              onClick={() =>
                dispatch({ type: "SET_DRILL_DOWN", payload: null })
              }
              sx={{ color: "secondary.main" }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography
                variant="caption"
                display="block"
                sx={{ opacity: 0.6, lineHeight: 1 }}
              >
                Viewing Hub
              </Typography>
              <Typography variant="body2" fontWeight="bold" noWrap>
                {drilledDownFeature.properties.title}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{ color: "secondary.main" }}
            >
              {layer.name.toUpperCase()} ({baseFeatures.length})
            </Typography>
            <Button
              size="small"
              onClick={() =>
                dispatch({ type: "SET_TABLE_LOADED", payload: false })
              }
            >
              Hide
            </Button>
          </Box>
        )}
      </Box>

      <Divider />

      {/* LIST AREA */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", bgcolor: "background.paper" }}>
        <List dense disablePadding>
          {currentPageFeatures.map((f: any) => {
            const id = String(f.id || f.properties?.id);
            const isSelected = selectedFeature?.id === id;
            const hasChildren = !!f.properties?.children;

            // Resolve Config (TableConfig > Mapping)
            const tConf =
              drilledDownFeature && layer.childTableConfig
                ? layer.childTableConfig
                : layer.tableConfig || {
                    primaryField: source.mapping.title,
                    secondaryField: source.mapping.dateStart,
                  };

            const primaryText = getDisplayValue(
              f,
              tConf.primaryField,
              tConf.resolvePrimary,
              entities
            );
            const secondaryText = getDisplayValue(
              f,
              tConf.secondaryField,
              tConf.resolveSecondary,
              entities
            );

            return (
              <ListItemButton
                key={id}
                selected={isSelected}
                onClick={() => {
                  // Extract coordinates for Map Pan
                  let coords = [0, 0];
                  if (f.geometry?.type === "Point")
                    coords = f.geometry.coordinates;
                  else if (f.geometry?.type === "LineString")
                    coords = f.geometry.coordinates[0];

                  dispatch({
                    type: "SELECT_FEATURE",
                    payload: {
                      id,
                      layerId: layer.id,
                      // we pass the templateId here for UI purpose
                      templateId: tConf.templateId,
                      longitude: coords[0],
                      latitude: coords[1],
                    },
                  });
                }}
                sx={{
                  borderLeft: isSelected
                    ? "4px solid"
                    : "4px solid transparent",
                  borderColor: "secondary.main",
                  py: 1,
                }}
              >
                <ListItemText
                  primary={primaryText}
                  secondary={secondaryText}
                  primaryTypographyProps={{
                    variant: "caption",
                    noWrap: true,
                    fontWeight: isSelected ? "bold" : "medium",
                    sx: {
                      display: "block",
                      mb: 0.2,
                      color: isSelected ? "secondary.main" : "text.primary",
                    },
                  }}
                  secondaryTypographyProps={{
                    variant: "caption",
                    sx: {
                      fontSize: "0.65rem",
                      opacity: 0.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    },
                  }}
                />

                {/* DRILL DOWN ACTION */}
                {hasChildren && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent selecting the hub itself
                      dispatch({ type: "SET_DRILL_DOWN", payload: f });
                    }}
                    sx={{ ml: 1, color: "secondary.main", opacity: 0.8 }}
                  >
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* FOOTER: Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.2)",
            flexShrink: 0,
          }}
        >
          <Pagination
            count={totalPages}
            page={tablePage + 1}
            onChange={(_, value) =>
              dispatch({ type: "SET_TABLE_PAGE", payload: value - 1 })
            }
            size="small"
            siblingCount={0}
            boundaryCount={1}
            color="secondary"
          />
        </Box>
      )}
    </Box>
  );
}
