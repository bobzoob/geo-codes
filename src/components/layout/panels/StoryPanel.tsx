import { Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useAppState } from "../../../state/appContext";
import ReactMarkdown from "react-markdown";

export default function StoryPanel() {
  const { state, dispatch } = useAppState();
  const { isStoryModeActive, storyManifest, currentStoryIndex } = state;

  if (!isStoryModeActive || !storyManifest) return null;

  const frame = storyManifest.frames[currentStoryIndex];
  const isFirst = currentStoryIndex === 0;
  const isLast = currentStoryIndex === storyManifest.frames.length - 1;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "rgba(2, 136, 209, 0.15)", // color change for story mode
        }}
      >
        <Typography variant="h6" color="info.main">
          Story Mode
        </Typography>
        <IconButton
          size="small"
          onClick={() => dispatch({ type: "EXIT_STORY" })}
          sx={{ color: "info.main" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
        <Typography
          variant="caption"
          color="info.main"
          fontWeight="bold"
          textTransform="uppercase"
        >
          {storyManifest.title} — {currentStoryIndex + 1} /{" "}
          {storyManifest.frames.length}
        </Typography>

        <Typography variant="h5" color="text.primary" sx={{ mt: 1, mb: 2 }}>
          {frame.title}
        </Typography>

        <Box
          sx={{ color: "text.secondary", "& p": { mb: 2, lineHeight: 1.6 } }}
        >
          <ReactMarkdown>{frame.text}</ReactMarkdown>
        </Box>
      </Box>

      {/* FOOTER CONTROLS */}
      <Box
        sx={{
          p: 2,
          flexShrink: 0,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          disabled={isFirst}
          onClick={() =>
            dispatch({
              type: "SET_STORY_FRAME",
              payload: currentStoryIndex - 1,
            })
          }
          startIcon={<ArrowBackIosNewIcon />}
          color="info"
        >
          Prev
        </Button>
        <Button
          disabled={isLast}
          onClick={() =>
            dispatch({
              type: "SET_STORY_FRAME",
              payload: currentStoryIndex + 1,
            })
          }
          endIcon={<ArrowForwardIosIcon />}
          variant="contained"
          color="info"
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
