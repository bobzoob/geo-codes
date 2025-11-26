import type { HistoricalFeature, EntityMap } from "../types/geojson";
import type { TimeRange, SearchState } from "../types/state";

/**
 * this function filters a feature based on the timeline range.
 */
const filterByTime = (
  feature: HistoricalFeature,
  timeRange: TimeRange
): boolean => {
  const featureStartYear = new Date(feature.properties.startDate).getFullYear();
  const featureEndYear = new Date(feature.properties.endDate).getFullYear();
  const [selectedStartYear, selectedEndYear] = timeRange;

  return (
    featureStartYear <= selectedEndYear && featureEndYear >= selectedStartYear
  );
};

/**
 * this function filters a feature based on the search criteria, using the entity diectionary
 */
const filterBySearch = (
  feature: HistoricalFeature,
  searchState: SearchState,
  entities: EntityMap
): boolean => {
  const {
    plainText,
    sender,
    recipient,
    location,
    searchStartDate,
    searchEndDate,
  } = searchState;
  const props = feature.properties;

  // resolve ID to Name
  const getName = (id?: string): string => {
    if (!id || !entities[id]) return "";
    return entities[id].name.toLowerCase();
  };

  // date specific search
  if (searchStartDate) {
    if (new Date(props.endDate) < new Date(searchStartDate)) return false;
  }
  if (searchEndDate) {
    if (new Date(props.startDate) > new Date(searchEndDate)) return false;
  }

  // plain text search
  if (plainText) {
    const term = plainText.toLowerCase();

    // direct properties on the letter
    const inName = props.name?.toLowerCase().includes(term);
    const inDesc = props.description?.toLowerCase().includes(term);

    // entities (for now: sender/recipient)
    const senderName = getName(props.senderId);
    const recipientName = getName(props.recipientId);

    // mentioned entities
    const mentionsMatch = props.mentionedEntityIds?.some((id) =>
      getName(id).includes(term)
    );

    if (
      !inName &&
      !inDesc &&
      !senderName.includes(term) &&
      !recipientName.includes(term) &&
      !mentionsMatch
    ) {
      return false;
    }
  }

  // field specific search, where we want only certain fields to be checked

  // sender
  if (sender) {
    const senderName = getName(props.senderId);
    if (!senderName.includes(sender.toLowerCase())) return false;
  }

  // recipient
  if (recipient) {
    const recipientName = getName(props.recipientId);
    if (!recipientName.includes(recipient.toLowerCase())) return false;
  }

  // location (source, destination, place)
  if (location) {
    const term = location.toLowerCase();

    const sourceName = getName(props.sourcePlaceId);
    const destName = getName(props.destinationPlaceId);
    const placeName = getName(props.placeId);

    if (
      !sourceName.includes(term) &&
      !destName.includes(term) &&
      !placeName.includes(term)
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Main filter function
 */
export const applyFilters = (
  feature: HistoricalFeature,
  timeRange: TimeRange,
  entities: EntityMap,
  searchState?: SearchState
): boolean => {
  // time filter
  if (!filterByTime(feature, timeRange)) {
    return false;
  }

  // search filter (if active)
  if (searchState) {
    if (!filterBySearch(feature, searchState, entities)) {
      return false;
    }
  }

  return true;
};
