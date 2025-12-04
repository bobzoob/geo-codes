import { Box, Link, Stack, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "primary.dark",
        color: "white", // text color to contrast with dark background
        paddingY: 2,
        paddingX: 3,
        zIndex: 1100, // Matches Header z-index
        boxShadow: "0px -2px 4px -1px rgba(0,0,0,0.2)", // Subtle shadow pointing up
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="xl"
        margin="0 auto" // Center content on very wide screens
      >
        {/* Left Side: Copyright or Branding */}
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} Historical Map Project
        </Typography>

        {/* Right Side: Legal Menu */}
        <Stack direction="row" spacing={3}>
          <Link href="#">Privacy Protection</Link>
          <Link href="#">License</Link>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Footer;
