// import { useState } from "react";
// import { Box, Button, Collapse, Stack, TextField } from "@mui/material";
// import type { SearchState, FilterComponentProps } from "../types/state";
// import { useAppState } from "../state/appContext";

//
//
// function PointSearchForm({ layer }: FilterComponentProps) {
//   const { dispatch } = useAppState();
//   const [isOpen, setIsOpen] = useState(false);

//
//   const [searchText, setSearchText] = useState(layer.search?.plainText || "");

//   const handleApply = () => {
//     // We create a new search state object, preserving any other potential
//     // search fields while updating the one we control.
//     const newSearchState: SearchState = {
//       ...layer.search!,
//       plainText: searchText,
//     };
//     dispatch({
//       type: "UPDATE_LAYER_SEARCH",
//       payload: { layerId: layer.id, searchState: newSearchState },
//     });
//   };

//   const handleClear = () => {
//     setSearchText("");
//     const clearedState: SearchState = { ...layer.search!, plainText: "" };
//     dispatch({
//       type: "UPDATE_LAYER_SEARCH",
//       payload: { layerId: layer.id, searchState: clearedState },
//     });
//   };

//   return (
//     <Box sx={{ marginTop: 1 }}>
//       <Button size="small" onClick={() => setIsOpen(!isOpen)}>
//         {isOpen ? "Hide Search" : "Show Search"}
//       </Button>
//       <Collapse in={isOpen}>
//         <Stack spacing={2} sx={{ padding: 2, borderTop: "1px solid #eee" }}>
//           <TextField
//             label="Search Name/Description"
//             variant="outlined"
//             size="small"
//             value={searchText}
//             onChange={(e) => setSearchText(e.target.value)}
//           />
//           <Stack direction="row" spacing={1}>
//             <Button variant="contained" size="small" onClick={handleApply}>
//               Apply
//             </Button>
//             <Button variant="outlined" size="small" onClick={handleClear}>
//               Clear
//             </Button>
//           </Stack>
//         </Stack>
//       </Collapse>
//     </Box>
//   );
// }

// export default PointSearchForm;
