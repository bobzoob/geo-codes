import { Box } from "@mui/material";
import type { LayerConfig } from "../../types/state";
import { filterRegistry } from "../../filters/filterRegistry";
import { useAppState } from "../../state/appContext";

/**
 * this helps the optionsPanel to render
 * updates and sets the list of active filters
 *  */
interface FilterListProps {
  layerId: string;
  filters: LayerConfig["activeFilters"];
  values: LayerConfig["filterValues"];
}

export function FilterList({ layerId, filters, values }: FilterListProps) {
  const { dispatch } = useAppState();

  if (!filters || filters.length === 0) return null;

  return (
    <>
      {filters.map((filterConfig, index) => {
        const moduleId = filterConfig.moduleId;
        const module = filterRegistry[moduleId];

        if (!module) return null;

        const Component = module.component;
        const currentValue = (values || {})[moduleId] ?? module.defaultValue;
        return (
          <Box
            key={`${moduleId}-${index}`}
            sx={{ marginTop: 2, width: "100%" }}
          >
            <Component
              layerId={layerId}
              value={currentValue}
              params={filterConfig.params} // for the fold-out suggestions
              onChange={(newValue: any) =>
                dispatch({
                  type: "UPDATE_FILTER_VALUE",
                  payload: {
                    layerId: layerId,
                    filterId: moduleId,
                    value: newValue,
                  },
                })
              }
              label={module.label}
            />
          </Box>
        );
      })}
    </>
  );
}
