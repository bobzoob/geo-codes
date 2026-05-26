/**
 * reusable logic for MapLibre expressions for highlighting/ hovering
 */

export const getHighlightExpressions = (
  highlightedIds: string[] = [],
  hoveredId?: string | null
) => {
  const safeHighlightedIds =
    highlightedIds.length > 0 ? highlightedIds : ["__none__"];

  const isHighlighted = [
    "in",
    ["to-string", ["get", "id"]],
    ["literal", safeHighlightedIds],
  ];

  const isHovered = [
    "==",
    ["to-string", ["get", "id"]],
    hoveredId ? String(hoveredId) : "__none__",
  ];

  return { isHighlighted, isHovered };
};
