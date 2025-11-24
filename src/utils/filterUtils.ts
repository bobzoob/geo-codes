import type { HistoricalFeature } from "../types/geojson";
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
 * this function filters a feature based on the search criteria, for now only "letters" layer

 */
const filterBySearch = (
  feature: HistoricalFeature,
  searchState: SearchState
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

  // case insensitive
  const plainTextLower = plainText.toLowerCase();
  const senderLower = sender.toLowerCase();
  const recipientLower = recipient.toLowerCase();

  // search across multiple fields, optional chaining (?.) for safty
  if (plainTextLower) {
    const inName = props.name?.toLowerCase().includes(plainTextLower);
    const inSender = props.sender?.toLowerCase().includes(plainTextLower);
    const inRecipient = props.recipient?.toLowerCase().includes(plainTextLower);
    const inDescription = props.description
      ?.toLowerCase()
      .includes(plainTextLower);
    // if plainText is present at least one field must match
    if (!(inName || inSender || inRecipient || inDescription)) {
      return false;
    }
  }

  // date-specific search
  if (searchStartDate) {
    if (new Date(props.endDate) < new Date(searchStartDate)) {
      return false;
    }
  }

  if (searchEndDate) {
    if (new Date(props.startDate) > new Date(searchEndDate)) {
      return false;
    }
  }

  // sender-specific search
  if (senderLower && !props.sender?.toLowerCase().includes(senderLower)) {
    return false;
  }

  // recipient-specific search
  if (
    recipientLower &&
    !props.recipient?.toLowerCase().includes(recipientLower)
  ) {
    return false;
  }

  // location-specific search
  if (location) {
    const searchLoc = location.toLowerCase();

    //  point data
    const matchPlace = props.place?.toLowerCase().includes(searchLoc);

    // line data (source OR destination)
    const matchSource = props.sourcePlace?.toLowerCase().includes(searchLoc);
    const matchDest = props.destinationPlace?.toLowerCase().includes(searchLoc);

    if (!matchPlace && !matchSource && !matchDest) {
      return false;
    }
  }

  return true;
};

/**
 * main filter function
 */
export const applyFilters = (
  feature: HistoricalFeature,
  timeRange: TimeRange,
  searchState?: SearchState
): boolean => {
  //  feature must always be within the time range
  if (!filterByTime(feature, timeRange)) {
    return false;
  }

  // if a search is active for this layer -> only then apply search filters
  if (searchState) {
    if (!filterBySearch(feature, searchState)) {
      return false;
    }
  }

  return true;
};
