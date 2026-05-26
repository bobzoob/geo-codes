import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
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
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {/* MINIMIZE BUTTON */}
          <Tooltip title="Minimize Panel">
            <IconButton
              size="small"
              onClick={() => dispatch({ type: "TOGGLE_STORY_PANEL" })}
              sx={{ color: "info.main" }}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
          </Tooltip>
        </Box>
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

        {/* OPTIONAL IMAGE RENDERER */}
        {frame.image && (
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src={frame.image.url}
              alt={frame.title}
              sx={{
                width: "100%",
                maxHeight: "250px",
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            {frame.image.signature && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 0.5, fontStyle: "italic", textAlign: "right" }}
              >
                {frame.image.signature}
              </Typography>
            )}
          </Box>
        )}

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
